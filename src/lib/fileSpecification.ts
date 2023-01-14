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

  /**
   * 
   * @param name Name of this file spec (eg; VESC)
   * @param delimiter the character used as a delimiter in the CSV (eg; ',' ';')
   * @param columns The columns that are included in this log data
   */
  constructor(name: string, delimiter: string, columns: FileSpecificationColumn[]) {
    this._name = name
    this._columns = columns
    this._delimiter = delimiter
  }

  get delimiter() {
    return this._delimiter
  }

  get columns() {
    return this._columns
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

    if (this._dataType.units.includes(this._unit)) {
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

export const vescFileSpecification = new FileSpecification(
  'VESC Log File',
  ';',
  [
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
  ]
)


export const allSpecifications = [
  vescFileSpecification
]