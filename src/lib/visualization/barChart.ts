import { allSingleValueDataTypes } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'


class BarChart extends DataTypeVisualization {
  _labelSize: number = 22
  _padding: number = 6
  _barHeight: number = 46

  constructor() {
    super(
      'Bar chart',
      allSingleValueDataTypes,
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

    let tile = new OffscreenCanvas(10, 10) //document.createElement('canvas')
    // tile.width = tile.height = 10
    let ctx = tile.getContext('2d')! as OffscreenCanvasRenderingContext2D
    let gradient = ctx.createLinearGradient(0, 0, tile.width, tile.height);
    let colorStops = [
      [0, videoOptions.backgroundColor],
      [0.35, videoOptions.backgroundColor],
      [0.35, videoOptions.foregroundColor],
      [0.5, videoOptions.foregroundColor],
      [0.5, videoOptions.backgroundColor],
      [0.85, videoOptions.backgroundColor],
      [0.85, videoOptions.foregroundColor],
      [1, videoOptions.foregroundColor]
    ]
    colorStops.forEach(element => {
      gradient.addColorStop(element[0] as number, element[1] as string)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, tile.width, tile.height)

    cache.hatch = tile
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
      // @ts-ignore
      context.letterSpacing = "-2px"
      context.font = `${this._labelSize}px Helvetica`
      context.fillText(
        seriesVideoDetail.name,
        this.absX(0, baseX),
        this.absY(y, baseY),
      )
      y += this._padding
    }

    let dRange = cache.max - cache.min
    let dValue = value - cache.min
    let fraction = dValue / dRange
    let valueWidth = fraction * this._width

    let tilePattern = context.createPattern(cache.hatch, 'repeat')!
    context.fillStyle = tilePattern
    context.fillRect(
      this.absX(0, baseX),
      this.absY(y, baseY),
      valueWidth,
      this._barHeight)

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.rect(
      this.absX(0, baseX),
      this.absY(y, baseY),
      this._width,
      this._barHeight)
    context.stroke()

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.fillStyle = videoOptions.foregroundColor
    context.rect(
      this.absX(valueWidth - 1, baseX),
      this.absY(y, baseY),
      3,
      this._barHeight)
    context.fill()

  }

}
export const barChart = new BarChart()
