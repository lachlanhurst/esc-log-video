import { parse } from 'csv-parse/browser/esm'


import { allSpecifications } from './fileSpecification'
import { LogFileData } from './logFileData'


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
    for (const fileSpec of allSpecifications) {
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
        console.log("Done reading file");
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
      console.log('parser end')
    })

    // some complicated code to read file in chunks and write those chunks
    // to the CSV parser
    var file = this._fileInfo.file.originFileObj
    await this.parseFilePromise(file, parser)

    // Close the readable stream
    parser.end()

    return this._logFileData
  }
}
