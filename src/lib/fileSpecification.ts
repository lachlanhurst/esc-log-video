/*
Definition of the file specifications that are supported. eg; the
VESC Log file is one file spec.
*/

import * as dataTypes from './dataTypes'
import * as units from './units'
import { DataType } from './dataTypes'
import { Unit } from './units'


export class FileSpecification {
  _name: string
  _delimiter: string
  _columns: FileSpecificationColumn[]
  // columns made up of other columns
  _compositeColumns: FileSpecificationCompositeColumn[]
  // columns that will be automatically added to UI when data has been loaded
  _defaultColumns: FileSpecificationColumn[]

  /**
   * 
   * @param name Name of this file spec (eg; VESC)
   * @param delimiter the character used as a delimiter in the CSV (eg; ',' ';')
   * @param columns The columns that are included in this log data
   */
  constructor(
    name: string,
    delimiter: string,
    columns: FileSpecificationColumn[],
    compositeColumns: FileSpecificationCompositeColumn[],
    defaultColumns: FileSpecificationColumn[] = []
  ) {
    this._name = name
    this._columns = columns
    this._compositeColumns = compositeColumns
    this._delimiter = delimiter
    this._defaultColumns = defaultColumns
  }

  get delimiter() {
    return this._delimiter
  }

  get columns() {
    return this._columns
  }

  get compositeColumns() {
    return this._compositeColumns
  }

  /**
   * List of columns that are automatically added to UI
   */
  get defaultColumns() {
    return this._defaultColumns
  }

  /**
   * Returns the column with the given name or undefined of not found
   * @param label 
   * @returns 
   */
  columnForLabel(label: string): FileSpecificationColumn | undefined {
    return this._columns.find(col => col.label == label)
  }
}

export class FileSpecificationColumn {
  _label: string
  _name: string
  _dataType: DataType
  _unit: Unit

  /**
   * Make a new file spec column
   * @param {*} label the label as used in the csv file to identify this column
   * @param {*} name the 'nice' name for the data contained in this column
   * @param {*} datatype the datatype that applies to this column. Can be null
   * @param {*} unit the unit that this column of data is provided in
   */
  constructor(label: string, name: string, dataType: DataType, unit: Unit) {
    this._label = label
    this._name = name
    this._dataType = dataType
    this._unit = unit

    if (!this._dataType.units.includes(this._unit)) {
      throw new Error(`Unit ${this._unit.name} is not applicable for datatype ${this._name}`);
    }
  }

  get name() {
    return this._name
  }

  get label() {
    return this._label
  }

  get dataType() {
    return this._dataType
  }

  get unit() {
    return this._unit
  }

}


export class FileSpecificationCompositeColumn extends FileSpecificationColumn{
  /**
   * Composite Columns are columns that are made up of more than one
   * FileSpecificationColumn. For example; Orientation is made up of
   * pitch/roll/yaw, Position is made up of latitude and longitude
   * columns.
   */
  _columns: FileSpecificationColumn[]

  constructor(columns: FileSpecificationColumn[], name: string, dataType: DataType) {
    super("", name, dataType, dataType.units[0])
    this._columns = columns
  }

  get columns() {
    return this._columns
  }

}


// specify a few columns that will later be used in definition
// of some composite columns
let roll = new FileSpecificationColumn(
  'roll',
  'Roll',
  dataTypes.angle,
  units.radian
)
let pitch = new FileSpecificationColumn(
  'pitch',
  'Pitch',
  dataTypes.angle,
  units.radian
)
let yaw = new FileSpecificationColumn(
  'yaw',
  'Yaw',
  dataTypes.angle,
  units.radian
)
let latitude = new FileSpecificationColumn(
  'gnss_lat',
  'Latitude',
  dataTypes.position,
  units.latitudeOrLongitude
)
let longitude = new FileSpecificationColumn(
  'gnss_lon',
  'Longitude',
  dataTypes.position,
  units.latitudeOrLongitude
)

const vescColumns = [
  new FileSpecificationColumn(
    'ms_today',
    'Time today',
    dataTypes.time,
    units.millisecond
  ),
  new FileSpecificationColumn(
    'input_voltage',
    'Input Voltage',
    dataTypes.voltage,
    units.volt
  ),
  new FileSpecificationColumn(
    'temp_mos_max',
    'MOSFET temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  new FileSpecificationColumn(
    'temp_motor',
    'Motor temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  new FileSpecificationColumn(
    'current_motor',
    'Motor current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'current_in',
    'Battery current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'encoder_position',
    'Encoder position',
    dataTypes.angle,
    units.degree
  ),
  roll,
  pitch,
  yaw,
  latitude,
  longitude,
  new FileSpecificationColumn(
    'gnss_alt',
    'Altitude',
    dataTypes.distance,
    units.meter
  ),
  new FileSpecificationColumn(
    'speed_meters_per_sec',
    'Speed',
    dataTypes.speed,
    units.metersPerSecond
  ),
  new FileSpecificationColumn(
    'gnss_gVel',
    'Speed (GPS)',
    dataTypes.speed,
    units.metersPerSecond
  ),
]


const vescCompositeColumns = [
  new FileSpecificationCompositeColumn(
    [yaw, pitch, roll],
    "Orientation",
    dataTypes.orientation
  ),
  new FileSpecificationCompositeColumn(
    [longitude, latitude],
    "Position",
    dataTypes.position
  ),
]


export const vescFileSpecification = new FileSpecification(
  'VESC Log File',
  ';',
  vescColumns,
  vescCompositeColumns,
  [
    vescColumns[0], vescColumns[2], vescColumns[5], vescColumns[4]
  ]
)


export const allSpecifications = [
  vescFileSpecification
]