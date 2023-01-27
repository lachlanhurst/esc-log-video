
import { DataType, allSingleValueDataTypes, time } from './dataTypes'
import { VideoOptions } from './videoOptions'
import { SeriesVideoDetail } from './seriesVideoDetail'
import { LogFileDataSeries } from './logFileData'
import { labelAndValue } from './visualizations/labelAndValue'
import { barChart } from './visualizations/barChart'


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

  width(seriesVideoDetail: SeriesVideoDetail, cache: CacheObject): number {
    return this._width
  }

  height(seriesVideoDetail: SeriesVideoDetail, cache: CacheObject): number {
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

  drawMask(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    cache: CacheObject,
    baseX: number,
    baseY: number,
    value: any
  ) {
    // default mask implementation is to unmask the entire
    // extent of the visualization. Visualizations may
    // overwrite this to mask less of the area.
    let w = this.width(seriesVideoDetail, cache)
    let h = this.height(seriesVideoDetail, cache)

    // white = not mask, black = mask
    context.fillStyle = "white"
    context.fillRect(
      this.absX(0, baseX),
      this.absY(0, baseY),
      w,
      h
    )

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
    context.rect(
      this.absX(0,baseX),
      this.absY(0, baseY),
      this.width(seriesVideoDetail, cache),
      this.height(seriesVideoDetail, cache)
    )
    context.stroke()
  }

}
export const onlyTime = new OnlyTime()
