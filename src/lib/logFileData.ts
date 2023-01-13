
import { FileSpecification, FileSpecificationColumn } from './fileSpecification'

class LogFileDataSeries {
  _column: FileSpecificationColumn
  _data: any[]

  constructor(column: FileSpecificationColumn) {
    this._column = column
    this._data = []
  }

  addValue(value: any) {
    this._data.push(value)
  }

  get column() {
    return this._column
  }

  get data() {
    return this._data
  }
}

/**
 * stores the data that has been read from the log file
 */
export class LogFileData {
  _fileSpecification: FileSpecification
  _seriesList: LogFileDataSeries[]

  constructor(fileSpecification: FileSpecification) {
    this._fileSpecification = fileSpecification
    this._seriesList = []
  }

  /**
   * Adds a new data series
   * @param column 
   * @returns the index of the series that was added
   */
  addSeries(column: FileSpecificationColumn): number {
    return this._seriesList.push(new LogFileDataSeries(column)) - 1
  }

  addSeriesValue(seriesIndex:number, value: any) {
    this._seriesList[seriesIndex].addValue(value)
  }

  get fileSpecification() {
    return this._fileSpecification
  }

  get seriesList() {
    return this._seriesList
  }
}