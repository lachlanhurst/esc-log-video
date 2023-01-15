
import { DataType } from './dataTypes'

/**
 * Data type visualization is a class that is responsible for drawing a specific
 * datatype (or datatypes plural) to the HTML canvas
 */
class DataTypeVisualization {
  _name: string
  _supportedDataTypes: DataType[]

  constructor(name: string, supportedDataTypes: DataType[]) {
    this._name = name
    this._supportedDataTypes = supportedDataTypes
  }

  get name(): string {
    return this._name
  }

  get supportedDataTypes(): DataType[] {
    return this._supportedDataTypes
  }

  /**
   * Check if this visualization supports the given data type
   * @param dataType 
   * @returns 
   */
  supportsDataType(dataType: DataType): boolean {
    return this._supportedDataTypes.includes(dataType)
  }

}