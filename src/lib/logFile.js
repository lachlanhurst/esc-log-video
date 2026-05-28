import { parse } from 'csv-parse/browser/esm'


import { allFileSpecifications } from './fileSpecificationUtils'
import { LogFileData } from './logFileData'
import { vescSingleFileSpecification } from './fileSpecifications/vescSingle'


function readFileAsync(info) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = reject;
    reader.readAsText(info.file.originFileObj);
  })
}

function readBlobAsTextAsync(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

export function readFirstLineAsync(info) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (e) => {
      let lines = e.target.result.split("\n")

      resolve(lines[0]);
    };

    reader.onerror = reject;
    // assume no more than 3000 bytes in first line
    var blob = info.file.originFileObj.slice(0, 3000);
    reader.readAsBinaryString(blob);
  })
}

export class LogFileReader {

  constructor(fileInfo) {
    this._fileInfo = fileInfo
    this._logFileData = null
    this._logFileToDataSeriesMap = {}
    this._progressCallback = null
  }

  /**
   * set a function to be called. Function must take single value (range 0.0 - 1.0)
   * @param {*} callback 
   */
  setProgressCallback(callback) {
    this._progressCallback = callback
  }

  /**
   * Identifies a file specification based on the first line of the file
   * @param {*} firstLine 
   */
  getFileSpecification(firstLine) {
    let matchingFileSpec = null
    let matchingFields = 0
    for (const fileSpec of allFileSpecifications) {
      let headerNames = firstLine.split(fileSpec.delimiter)
      let fileSpecMatches = 0
      for (const column of fileSpec.columns) {
        for (const headerName of headerNames) {
          if (column.label == headerName) {
            fileSpecMatches += 1
          }
        }
      }

      if (fileSpecMatches > matchingFields) {
        matchingFileSpec = fileSpec
        matchingFields = fileSpecMatches
      }
    }

    if (matchingFields > 0) {
      return matchingFileSpec
    } else {
      return null
    }
  }

  parseFile(file, callback, callbackDone, callbackError) {
    // Adapted from
    //     https://stackoverflow.com/a/28318964/5416735
    var fileSize = file.size;
    var chunkSize = 64 * 1024; // bytes
    var offset = 0;
    var self = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function (evt) {
      if (evt.target.error == null) {
        offset += evt.target.result.length;
        callback(evt.target.result); // callback for handling read chunk
      } else {
        console.log("Read error: " + evt.target.error);
        callbackError()
        return;
      }
      if (offset >= fileSize) {
        callbackDone()
        return;
      }

      // of to the next chunk
      chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock =  (_offset, length, _file) => {
      var r = new FileReader();
      var blob = _file.slice(_offset, length + _offset);
      if (this._progressCallback != null) {
        this._progressCallback(_offset / fileSize)
      }
      r.onload = readEventHandler;
      r.readAsText(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
  }

  parseFilePromise(file, parser) {
    return new Promise((resolve, reject) => {
      let cb = function(chunk) {
        // console.log(chunk)
        parser.write(chunk)
      }
      let cbDone = function() {
        resolve()
      }
      let cbError = function () {
        reject()
      }
      this.parseFile(file, cb, cbDone, cbError)
    })
  }

  processRecord(record) {
    if (this._headerLine) {
      for (let i = 0; i < record.length; i++) {
        let headerLabel = record[i]
        for (let j = 0; j < this._logFileData.fileSpecification.columns.length; j++) {
          let col = this._logFileData.fileSpecification.columns[j]
          if (headerLabel == col.label) {
            let seriesIndex = this._logFileData.addSeries(col)
            this._dataSeriesToLogMap[seriesIndex] = i
          }
        }
      }
      this._headerLine = false
    } else {
      for (const [dataSeriesIndex, fileColumnIndex] of Object.entries(this._dataSeriesToLogMap)) {
        let value = record[fileColumnIndex]
        this._logFileData.addSeriesValue(dataSeriesIndex, value)
      }
    }
  }


  async read() {
    var file = this._fileInfo.file.originFileObj
    let lowerName = (file.name || '').toLowerCase()
    let isJson = lowerName.endsWith('.json') || file.type === 'application/json'
    if (isJson) {
      return this.readJson(file)
    }

    let firstLine = await readFirstLineAsync(this._fileInfo)
    let fileSpec = this.getFileSpecification(firstLine)

    this._logFileData = new LogFileData(fileSpec)
    this._dataSeriesToLogMap = {}
    this._headerLine = true
    
    // setup CSV parser
    const parser = parse({
      delimiter: fileSpec.delimiter
    })
    // Use the readable stream api to consume records
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        this.processRecord(record)
      }
    })
    // Catch any error
    parser.on('error', function (err) {
      console.error(err.message);
    })

    parser.on('end', function () {
      // console.log('parser end')
    })

    // some complicated code to read file in chunks and write those chunks
    // to the CSV parser
    await this.parseFilePromise(file, parser)

    // Close the readable stream
    parser.end()

    return this._logFileData
  }

  getLastKnownValue(logs, index, key, zeroMeansMissing = false) {
    let current = logs[index] && logs[index][key]
    let currentMissing = current == null || (zeroMeansMissing && current === 0)
    if (!currentMissing) {
      return current
    }

    for (let i = index - 1; i >= 0; i--) {
      let value = logs[i] && logs[i][key]
      let missing = value == null || (zeroMeansMissing && value === 0)
      if (!missing) {
        return value
      }
    }

    return 0
  }

  alignLocationIndex(locations, startIndex, logTimestamp) {
    let locationIndex = startIndex
    while (
      locationIndex + 1 < locations.length
      && locations[locationIndex + 1].timestamp <= logTimestamp
    ) {
      locationIndex += 1
    }
    return locationIndex
  }

  normalizeSpeedToBaseUnits(speed, speedLooksKmh = false) {
    let rawSpeed = Number(speed || 0)
    if (speedLooksKmh) {
      return rawSpeed / 3.6
    }
    return rawSpeed
  }

  async readJson(file) {
    let text = await readBlobAsTextAsync(file)
    let json = JSON.parse(text)
    if (!json || !Array.isArray(json.logs) || !Array.isArray(json.locations)) {
      throw new Error('Unsupported JSON format. Expected Floaty JSON with logs and locations arrays.')
    }

    let logs = json.logs
    let locations = json.locations
    let fileSpec = vescSingleFileSpecification.clone()

    // Floaty JSON does not provide the full VESC IMU payload. Hide the columns
    // that would otherwise appear as misleading zero-filled series in the UI.
    const columnsToHide = [
      'accX',
      'accY',
      'accZ',
      'encoder_position',
      'gnss_vVel',
      'gnss_vAcc',
    ]
    for (const col of fileSpec.columns) {
      if (columnsToHide.includes(col.label)) {
        col._hidden = true
      }
    }

    let data = new LogFileData(fileSpec)
    let seriesIndexByLabel = {}

    let addSeriesByLabel = (label) => {
      let col = fileSpec.columnForLabel(label)
      if (!col) {
        return
      }
      seriesIndexByLabel[label] = data.addSeries(col)
    }

    ;[
      'ms_today',
      'input_voltage',
      'temp_mos_max',
      'temp_motor',
      'speed_meters_per_sec',
      'duty_cycle',
      'battery_level',
      'amp_hours_used',
      'amp_hours_charged',
      'watt_hours_used',
      'watt_hours_charged',
      'accX',
      'accY',
      'accZ',
      'encoder_position',
      'roll',
      'pitch',
      'yaw',
      'gnss_lat',
      'gnss_lon',
      'gnss_alt',
      'gnss_gVel',
      'current_in',
      'current_motor',
    ].forEach(addSeriesByLabel)

    let startTime = Number(json.startTime || 0)
    if (!startTime && logs.length > 0) {
      startTime = Number(logs[0].timestamp || 0)
    }

    let maxLogSpeed = 0
    for (const log of logs) {
      let s = log && log.speed
      if (s != null && s > maxLogSpeed) {
        maxLogSpeed = s
      }
    }
    // Floaty commonly records speed in km/h, VESC expects m/s.
    let logsSpeedIsKmh = maxLogSpeed > 35

    let maxLocationSpeed = 0
    for (const location of locations) {
      let s = location && location.speed
      if (s != null && s > maxLocationSpeed) {
        maxLocationSpeed = s
      }
    }
    // In Floaty JSON the GPS speed is often stored in km/h as well.
    // We keep the conversion conservative and only apply it when the
    // observed range looks like km/h rather than m/s.
    let locationSpeedIsKmh = maxLocationSpeed > 20

    let locationIndex = 0
    for (let i = 0; i < logs.length; i++) {
      let log = logs[i] || {}
      let logTimestamp = Number(log.timestamp || startTime)

      if (locations.length > 0) {
        locationIndex = this.alignLocationIndex(locations, locationIndex, logTimestamp)
      }
      let location = locations[locationIndex] || {}

      let speed = this.getLastKnownValue(logs, i, 'speed')
      if (logsSpeedIsKmh) {
        speed = speed / 3.6
      }

      let rowByLabel = {
        ms_today: logTimestamp - startTime,
        input_voltage: this.getLastKnownValue(logs, i, 'batteryVolts'),
        temp_mos_max: this.getLastKnownValue(logs, i, 'controllerTemp', true),
        temp_motor: this.getLastKnownValue(logs, i, 'motorTemp', true),
        speed_meters_per_sec: speed,
        duty_cycle: this.getLastKnownValue(logs, i, 'dutyCycle'),
        battery_level: this.getLastKnownValue(logs, i, 'batteryPercent'),
        amp_hours_used: this.getLastKnownValue(logs, i, 'ampHours'),
        amp_hours_charged: 0,
        watt_hours_used: this.getLastKnownValue(logs, i, 'wattHours'),
        watt_hours_charged: 0,
        accX: 0,
        accY: 0,
        accZ: 0,
        encoder_position: 0,
        roll: this.getLastKnownValue(logs, i, 'rollAngle'),
        pitch: this.getLastKnownValue(logs, i, 'pitchAngle'),
        // Floaty does not expose yaw. We mirror pitch here so the
        // attitude composite remains populated and behaves like the
        // existing Float Control fallback.
        yaw: this.getLastKnownValue(logs, i, 'pitchAngle'),
        gnss_lat: Number(location.latitude || 0),
        gnss_lon: Number(location.longitude || 0),
        gnss_alt: Number(location.altitude || 0),
        gnss_gVel: this.normalizeSpeedToBaseUnits(location.speed, locationSpeedIsKmh),
        current_in: this.getLastKnownValue(logs, i, 'batteryCurrent'),
        current_motor: this.getLastKnownValue(logs, i, 'motorCurrent'),
      }

      for (const [label, seriesIndex] of Object.entries(seriesIndexByLabel)) {
        data.addSeriesValue(seriesIndex, rowByLabel[label])
      }

      if (this._progressCallback != null && i % 300 === 0) {
        this._progressCallback(i / Math.max(logs.length, 1))
      }
    }

    if (this._progressCallback != null) {
      this._progressCallback(1.0)
    }

    return data
  }
}
