import { allSingleValueDataTypes } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'


class Sparkline extends DataTypeVisualization {
  _labelSize: number = 22
  _padding: number = 6
  _chartHeight: number = 46
  _sparklineTime: number = 5

  constructor() {
    super(
      'Sparkline',
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
    h += this._chartHeight
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

    // initialize the array we're going to put the previous data into
    // so that we can draw a time series based chart in the draw call
    cache.previousData = []

    // how many frames worth of previous data do we keep
    cache.previousDataLength = videoOptions.fps * this._sparklineTime
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


    // push a new value onto the start of the array
    cache.previousData.unshift(value)
    if (cache.previousData.length > cache.previousDataLength) {
      // if the array is longer than its limit, remove the last value
      cache.previousData.pop()
    }

    if (cache.previousData.length <= 1) {
      // not enough info to draw
      return
    }

    let dRangeY = cache.max - cache.min
    let dValueY = value - cache.min
    let fractionY = dValueY / dRangeY
    let valueHeight = this._chartHeight - fractionY * this._chartHeight
    
    let xOffset = 5

    // now draw the sparkline
    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 4
    context.moveTo(
      this.absX(0, baseX + xOffset),
      this.absY(valueHeight, baseY + y),
    )

    let fractionsAndLineWidths = [
      [0.015625, 3.5],
      [0.03125, 3.0],
      [0.0625, 2.5],
      [0.125, 2.0],
      [0.25, 1.5],
      [0.5, 1.25],
      [0.75, 1.0],
    ]

    let lastFrac = 0.0
    let lastX = 0
    let lastY = 0
    for (let i = 1; i < cache.previousData.length; i++) {
      let thisFrac = i / cache.previousDataLength

      fractionsAndLineWidths.forEach((flw) => {
        let frac = flw[0]
        let lw = flw[1]
        if (thisFrac >= frac && lastFrac < frac) {
          context.stroke()
          context.lineWidth = lw
          context.moveTo(
            this.absX(lastX, baseX + xOffset),
            this.absY(lastY, baseY + y),
          )
        }
      })
      let prevValue = cache.previousData[i]
      let dPrevValueY = prevValue - cache.min
      let prevFractionY = dPrevValueY / dRangeY
      let prevValueHeight = this._chartHeight - prevFractionY * this._chartHeight
      let prevValueX = i * ((this._width - xOffset * 2) / cache.previousDataLength)
      context.lineTo(
        this.absX(prevValueX, baseX + xOffset),
        this.absY(prevValueHeight, baseY + y),
      )
      lastX = prevValueX
      lastY = prevValueHeight
      lastFrac = thisFrac
    }
    context.stroke()
  }

}
export const sparkline = new Sparkline()
