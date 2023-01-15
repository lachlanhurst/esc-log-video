
import { DataType, allDataTypes, time } from './dataTypes'

export class DataTypeVisualizationOption {
  _dataType: string
  _name: string
  _options: string[]
}


/**
 * Data type visualization is a class that is responsible for drawing a specific
 * datatype (or datatypes plural) to the HTML canvas
 */
export class DataTypeVisualization {
  _name: string
  _supportedDataTypes: DataType[]
  _options: DataTypeVisualizationOption[]

  _width: number
  _height: number

  constructor(name: string, supportedDataTypes: DataType[], options: DataTypeVisualizationOption[]) {
    this._name = name
    this._supportedDataTypes = supportedDataTypes
    this._options = options
  }

  get name(): string {
    return this._name
  }

  get supportedDataTypes(): DataType[] {
    return this._supportedDataTypes
  }

  get options(): DataTypeVisualizationOption[] {
    return this._options
  }

  get width(): number {
    return this._width
  }

  get height(): number {
    return this._height
  }


  absX(xRel: number, baseX: number): number {
    return baseX + xRel
  }

  absY(yRel: number, baseY: number): number {
    return baseY + yRel
  }

  draw(context: CanvasRenderingContext2D, baseX: number, baseY: number) {
    throw new Error('Method "draw()" must be implemented.')
  }

  /**
   * Check if this visualization supports the given data type
   * @param dataType 
   * @returns 
   */
  supportsDataType(dataType: DataType): boolean {
    for (let sdt of this._supportedDataTypes) {
      if (sdt.name == dataType.name) {
        return true
      }
    }
    return false
  }

}


class LabelAndValue extends DataTypeVisualization {

  constructor() {
    super(
      'Label and value text',
      allDataTypes,
      []
    )
    this._width = 300
    this._height = 30
  }

  draw(context: CanvasRenderingContext2D, baseX: number, baseY: number): void {
    context.beginPath()
    // context.lineWidth = 6
    context.strokeStyle = "red"
    context.rect(this.absX(0, baseX), this.absY(0, baseY), this.width, this.height)
    context.stroke()
  }

}
const labelAndValue = new LabelAndValue()

class OnlyTime extends DataTypeVisualization {

  constructor() {
    super(
      'Only Time (test)',
      [time],
      []
    )
    this._width = 200
    this._height = 50
  }

  draw(context: CanvasRenderingContext2D, baseX: number, baseY: number): void {
    context.beginPath()
    // context.lineWidth = 6
    context.strokeStyle = "blue"
    context.rect(this.absX(0,baseX), this.absY(0, baseY), this.width, this.height)
    context.stroke()
  }

}
const onlyTime = new OnlyTime()

class NoVisualization extends DataTypeVisualization {

  constructor() {
    super(
      'No Viz',
      [time],
      []
    )
    this._width = 200
    this._height = 50
  }

}
const noViz = new NoVisualization()


export const allVisualizations: DataTypeVisualization[] = [
  labelAndValue,
  onlyTime
]

export const getVisualization = (dataType: DataType): DataTypeVisualization => {
  for (let vis of allVisualizations) {
    if (vis.supportsDataType(dataType)) {
      return vis
    }
  }

  return noViz
}