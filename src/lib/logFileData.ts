
import { FileSpecification, FileSpecificationColumn } from './fileSpecification'

export class LogFileDataSeries {
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
    let rawValue = Number(value)
    let baseUnitsValue = this._seriesList[seriesIndex].column.unit.toBaseUnit(rawValue)
    this._seriesList[seriesIndex].addValue(baseUnitsValue)
  }

  get fileSpecification(): FileSpecification {
    return this._fileSpecification
  }

  get seriesList(): LogFileDataSeries[] {
    return this._seriesList
  }

  seriesForColumn(column: FileSpecificationColumn): LogFileDataSeries | undefined {
    return this._seriesList.find((series) => series.column == column)
  }

  get seriesColumns(): FileSpecificationColumn[] {
    return this._seriesList.map(s => s._column)
  }



  buildCompositeSeries() {
    /**
     * A FileSpecification may specify a number of composite columns that
     * are made up of other columns. Calling this function will generate
     * LogFileDataSeries for these columns based on the data that has
     * already been read.
     */
    for (let cc of this.fileSpecification.compositeColumns) {
      // need to check that all columns needed by this composite column
      // have been loaded and are available
      let allSeriesAvailable = true
      for (let c of cc.columns) {
        if (!this.seriesColumns.includes(c)) {
          allSeriesAvailable = false
        }
      }
      if (!allSeriesAvailable) {
        // then skip and go onto next composite column
        continue
      }
      let compositeSeries = new LogFileDataSeries(cc)
      let compositeSeriesInputList = cc.columns.map(ccCol => this.seriesForColumn(ccCol))
      for (let i = 0 ; i < compositeSeriesInputList[0]!.data.length; i++) {
        let seriesValues = compositeSeriesInputList.map(cci => cci!.data[i])
        compositeSeries.addValue(seriesValues)
      }
      this._seriesList.push(compositeSeries)
    }
  }
}