
import { DataType, allDataTypes, time } from './dataTypes'
import { VideoOptions } from './videoOptions'
import { SeriesVideoDetail } from './SeriesVideoDetail'
import { LogFileDataSeries } from './logFileData'

export class DataTypeVisualizationOption {
  _dataType: string
  _name: string
  _options: string[]
}

export interface CacheObject {
  [key: string]: any
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

  /**
   * Function is called after each change to the data, VideoOptions, or
   * SeriesVideoDetails. You should do any initialization of details needed
   * to draw this visualization here and add those details to the `cache`
   * object. We cant change the vis itself as this causes a reactive/recursive
   * issue.
   * @param cache
   */
  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    // nothing to do in base class, override if needed
    // console.log("init " + seriesVideoDetails.visualization.name + " " + seriesVideoDetails.name)
  }

  draw(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    cache: CacheObject,
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
  _labelSize: number = 22
  _valueSize: number = 64
  _unitSize: number = 32
  _padding: number = 6

  constructor() {
    super(
      'Label and value text',
      allDataTypes,
      []
    )
    this._width = 260
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
    cache: CacheObject,
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


class BarChart extends DataTypeVisualization {
  _labelSize: number = 22
  _padding: number = 6
  _barHeight: number = 46

  constructor() {
    super(
      'Bar chart',
      allDataTypes,
      []
    )
    this._width = 260
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    let h: number = 0
    if (seriesVideoDetail.name.length != 0) {
      h += this._labelSize
      h += this._padding
    }
    h += this._barHeight
    return h
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    // need to get and store the min/max values so we can draw the chart
    let min = Math.min(...logFileDataSeries.data)
    let max = Math.max(...logFileDataSeries.data)
    min = seriesVideoDetails.unit.convert(min)
    max = seriesVideoDetails.unit.convert(max)
    cache.min = min
    cache.max = max
  }

  draw(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    cache: CacheObject,
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

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.rect(
      this.absX(0, baseX),
      this.absY(y, baseY),
      this._width,
      this._barHeight)
    context.stroke()

    let dRange = cache.max - cache.min
    let dValue = value - cache.min
    let fraction = dValue / dRange
    let valueWidth = fraction * this._width

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.rect(
      this.absX(0, baseX),
      this.absY(y, baseY),
      valueWidth,
      this._barHeight)
    context.stroke()

  }

}
const barChart = new BarChart()



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
    cache: CacheObject,
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
  barChart,
  onlyTime,
]

export const getVisualization = (dataType: DataType): DataTypeVisualization => {
  for (let vis of allVisualizations) {
    if (vis.supportsDataType(dataType)) {
      return vis
    }
  }

  return noViz
}