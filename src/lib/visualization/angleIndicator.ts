import { angle } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'


class AngleIndicator extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 64
  _unitSize: number = 32
  _padding: number = 6

  constructor() {
    super(
      'Angle indicator',
      [angle],
      []
    )
    this._width = 260
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    let h: number = 0
    h += this._labelSize
    h += this._padding
    h += this._valueSize
    h -= 18  // text sizing is hard
    return h
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {

    let tile = new OffscreenCanvas(10, 10)
    let ctx = tile.getContext('2d')!
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

    let h = this.height(seriesVideoDetail)
    let circleDiameter = h
    let circleRadius = h / 2

    let circleCenterX = this.absX(baseX, this._width - circleRadius)
    let circleCenterY = this.absY(baseY, circleRadius)

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

    let tilePattern = context.createPattern(cache.hatch, 'repeat')!

    context.beginPath()
    context.fillStyle = tilePattern
    context.arc(
      circleCenterX,
      circleCenterY,
      circleRadius,
      value,
      value + Math.PI
    )
    context.fill();

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.arc(
      circleCenterX,
      circleCenterY,
      circleRadius,
      value,
      value + Math.PI
    )
    context.closePath();
    context.stroke();

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.arc(
      circleCenterX,
      circleCenterY,
      circleRadius,
      value + Math.PI,
      value,
    )
    context.closePath();
    context.stroke();


    // let dRange = cache.max - cache.min
    // let dValue = value - cache.min
    // let fraction = dValue / dRange
    // let valueWidth = fraction * this._width

    
    // context.fillStyle = tilePattern
    // context.fill
    // context.fillRect(
    //   this.absX(0, baseX),
    //   this.absY(y, baseY),
    //   valueWidth,
    //   this._barHeight)

    // context.beginPath()
    // context.strokeStyle = videoOptions.foregroundColor
    // context.lineWidth = 2
    // context.rect(
    //   this.absX(0, baseX),
    //   this.absY(y, baseY),
    //   this._width,
    //   this._barHeight)
    // context.stroke()

    // context.beginPath()
    // context.strokeStyle = videoOptions.foregroundColor
    // context.fillStyle = videoOptions.foregroundColor
    // context.rect(
    //   this.absX(valueWidth - 1, baseX),
    //   this.absY(y, baseY),
    //   3,
    //   this._barHeight)
    // context.fill()

  }

}
export const angleIndicator = new AngleIndicator()
