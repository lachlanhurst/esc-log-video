import { angle } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'


class AngleIndicator extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 184
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

    let rad = (this._labelSize + this._padding + this._valueSize - 18) / 2
    let semiCircle = new OffscreenCanvas(rad*2, rad*2)
    let context = semiCircle.getContext('2d')! as OffscreenCanvasRenderingContext2D
    let tilePattern = context.createPattern(tile, 'repeat')!
    context.beginPath()
    context.fillStyle = tilePattern
    context.arc(
      rad,
      rad,
      rad,
      0,
      Math.PI
    )
    context.fill();

    cache.semiCircle = semiCircle
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

    // this way we can be sure it's always in radians
    value = seriesVideoDetail.unit.toBaseUnit(value)

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


    let semiCircle = cache.semiCircle

    let semiCircleRotated = new OffscreenCanvas(circleDiameter, circleDiameter)
    let semiCircleRotatedContext = semiCircleRotated.getContext('2d')! as OffscreenCanvasRenderingContext2D
    semiCircleRotatedContext.translate(circleRadius, circleRadius);
    semiCircleRotatedContext.rotate(value);
    semiCircleRotatedContext.drawImage(semiCircle, -circleDiameter / 2, -circleDiameter / 2, circleDiameter, circleDiameter);
    semiCircleRotatedContext.rotate(-value);
    semiCircleRotatedContext.translate(-circleRadius, -circleRadius);
    context.drawImage(semiCircleRotated, circleCenterX - circleRadius, circleCenterY - circleRadius)


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

  }

  drawMask(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    cache: CacheObject,
    baseX: number,
    baseY: number,
    value: any): void
  {
    let maskPadding = 4

    let h = this.height(seriesVideoDetail)
    let circleDiameter = h
    let circleRadius = h / 2

    let circleCenterX = this.absX(baseX, this._width - circleRadius)
    let circleCenterY = this.absY(baseY, circleRadius)

    context.fillStyle = "white"

    let y = this.absY(baseY, 0)
    if (seriesVideoDetail.name.length != 0) {
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = "-2px"
      context.font = `${this._labelSize}px Helvetica`
      let labelSize = context.measureText(seriesVideoDetail.name)
      let labelX = this.absX(baseX, 0)
      let labelWidth = circleCenterX - labelX
      let labelHeight = labelSize.actualBoundingBoxAscent + labelSize.actualBoundingBoxDescent
      let labelY = y + this._labelSize - labelSize.actualBoundingBoxAscent

      labelX -= maskPadding
      labelY -= maskPadding
      labelHeight += (2 * maskPadding)
      labelWidth += maskPadding

      context.fillRect(labelX, labelY, labelWidth, labelHeight)
    }

    context.beginPath()
    context.arc(
      circleCenterX,
      circleCenterY,
      circleRadius + maskPadding,
      0,
      Math.PI * 2
    )
    context.fill()
  }
}
export const angleIndicator = new AngleIndicator()
