
import { DataType, allDataTypes, time } from './dataTypes'
import { VideoOptions } from './videoOptions'
import { SeriesVideoDetail } from './SeriesVideoDetail'

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

  width(seriesVideoDetail: SeriesVideoDetail): number {
    return this._width
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    return this._height
  }

  absX(xRel: number, baseX: number): number {
    return baseX + xRel
  }

  absY(yRel: number, baseY: number): number {
    return baseY + yRel
  }

  draw(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    baseX: number,
    baseY: number,
    value: any
  ) {
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
  _labelSize: number = 20
  _valueSize: number = 60
  _unitSize: number = 30
  _padding: number = 6

  constructor() {
    super(
      'Label and value text',
      allDataTypes,
      []
    )
    this._width = 300
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    let h: number = 0
    if (seriesVideoDetail.name.length != 0) {
      h += this._labelSize
      h += this._padding
    }
    h += this._valueSize
    h -= 18  // text sizing is hard
    return h
  }

  draw(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    baseX: number,
    baseY: number,
    value: any
  ): void {
    let valueText = seriesVideoDetail.unit.format(value)
    // context.beginPath()
    // context.strokeStyle = "red"
    // context.rect(this.absX(0, baseX), this.absY(0, baseY), this.width(seriesVideoDetail), this.height(seriesVideoDetail))
    // context.stroke()

    let y = 0

    if (seriesVideoDetail.name.length != 0) {
      y += this._labelSize
      context.beginPath()
      context.fillStyle = videoOptions.foregroundColor
      context.textAlign = 'start'
      context.letterSpacing = "-2px"
      context.font = `${this._labelSize}px Helvetica`
      context.fillText(
        seriesVideoDetail.name,
        this.absX(0, baseX),
        this.absY(y, baseY),
      )
      y += this._padding
    }

    // context.beginPath()
    // context.strokeStyle = "yellow"
    // context.rect(
    //   this.absX(0, baseX),
    //   this.absY(y, baseY),
    //   200,
    //   this._valueSize)
    // context.stroke()

    y += this._valueSize - 18 // -18 cause text size is hard

    context.fillStyle = videoOptions.foregroundColor
    context.textAlign = 'end'
    context.letterSpacing = "-5px"
    context.font = `bold ${this._valueSize}px Helvetica`
    context.fillText(
      `${valueText}`,
      this.absX(0, baseX) + 200,
      this.absY(y, baseY),
      200
    )

    context.fillStyle = videoOptions.foregroundColor
    context.textAlign = 'start'
    context.letterSpacing = "-2px"
    context.font = `${this._unitSize}px Helvetica`
    context.fillText(
      `${seriesVideoDetail.unit.symbol}`,
      this.absX(0, baseX) + 200 + 2,
      this.absY(y, baseY),
      100
    )

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

  draw(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    baseX: number,
    baseY: number,
    value: any
  ): void {
    context.beginPath()
    // context.lineWidth = 6
    context.strokeStyle = "blue"
    context.rect(this.absX(0,baseX), this.absY(0, baseY), this.width(seriesVideoDetail), this.height(seriesVideoDetail))
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