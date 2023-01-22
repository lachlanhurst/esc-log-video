/*
Definition of the file specifications that are supported. eg; the
VESC Log file is one file spec.
*/

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
  _hidden: boolean

  /**
   * Make a new file spec column
   * @param {*} label the label as used in the csv file to identify this column
   * @param {*} name the 'nice' name for the data contained in this column
   * @param {*} datatype the datatype that applies to this column. Can be null
   * @param {*} unit the unit that this column of data is provided in
   * @param {*} hidden hide this column from the user (default is false)
   */
  constructor(label: string, name: string, dataType: DataType, unit: Unit, hidden: boolean = false) {
    this._label = label
    this._name = name
    this._dataType = dataType
    this._unit = unit
    this._hidden = hidden

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

  get hidden() {
    return this._hidden
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
