import { orientation } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'


class AttitudeIndicator extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 184
  _unitSize: number = 32
  _padding: number = 6

  constructor() {
    super(
      'Attitude Indicator',
      [orientation],
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

  minMax2d(array, index) {
    var max = Number.MIN_VALUE
    var min = Number.MAX_VALUE
    array.forEach((e) => {
      if (max < e[index]) {
        max = e[index]
      }
      if (min > e[index]) {
        min = e[index]
      }
    })
    return {
      min: min,
      max: max
    }
  }

  get rad() {
    return (this._labelSize + this._padding + this._valueSize - 18) / 2
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {

    cache.maxPitch = 25 * (Math.PI / 180)
    cache.minPitch = -25 * (Math.PI / 180)

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

    let squareSize = this.rad * 4
    let halfSquare = new OffscreenCanvas(squareSize, squareSize)
    let context = halfSquare.getContext('2d')!
    let tilePattern = context.createPattern(tile, 'repeat')!
    context.beginPath()
    context.fillStyle = tilePattern
    context.fillRect(
      0,
      squareSize/2,
      squareSize,
      squareSize/2,
    )

    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.rect(
      0,
      squareSize / 2,
      squareSize,
      squareSize / 2
    )
    // context.rect(
    //   squareSize / 2 - 10,
    //   squareSize / 2 - 10,
    //   20,
    //   20
    // )
    context.stroke()

    cache.halfSquare = halfSquare
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
    let yaw = value[0]
    let pitch = value[1]
    let roll = value[2]

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

    let halfUsablePitchPxHeight = circleRadius * 0.9
    let pitchMax = Math.abs(cache.maxPitch)
    let radToPxRatio = halfUsablePitchPxHeight / pitchMax
    let pitchPx = radToPxRatio * pitch




    let semiCircle = cache.halfSquare

    let semiCircleRotated = new OffscreenCanvas(circleDiameter*2, circleDiameter*2)
    let semiCircleRotatedContext = semiCircleRotated.getContext('2d')!
    semiCircleRotatedContext.translate(circleDiameter, circleDiameter)
    semiCircleRotatedContext.rotate(roll)
    semiCircleRotatedContext.drawImage(semiCircle, -circleDiameter, -circleDiameter , circleDiameter * 2, circleDiameter * 2)
    semiCircleRotatedContext.rotate(-roll)
    semiCircleRotatedContext.translate(-circleDiameter, -circleDiameter)


    let semiCircleTranslated = new OffscreenCanvas(circleDiameter, circleDiameter)
    let semiCircleTranslatedContext = semiCircleTranslated.getContext('2d')!

    semiCircleTranslatedContext.beginPath()
    semiCircleTranslatedContext.arc(circleRadius, circleRadius, circleRadius, 0, 2 * Math.PI, false)
    semiCircleTranslatedContext.clip()

    semiCircleTranslatedContext.translate(0, -pitchPx)
    semiCircleTranslatedContext.drawImage(semiCircleRotated, -circleRadius, -circleRadius, circleDiameter*2, circleDiameter*2)
    semiCircleTranslatedContext.translate(0, pitchPx)
    


    context.drawImage(semiCircleTranslated, circleCenterX - circleRadius , circleCenterY - circleRadius )

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI, false)
    context.stroke()

    let crossLineLength = circleDiameter / 14
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(circleCenterX - crossLineLength / 2, circleCenterY)
    context.lineTo(circleCenterX + crossLineLength / 2, circleCenterY)
    context.moveTo(circleCenterX, circleCenterY - crossLineLength / 2)
    context.lineTo(circleCenterX, circleCenterY + crossLineLength / 2)
    context.stroke()

    let angleIndicatorDegrees = [20, 15, 10, 5, -5, -10, -15, -20]
    context.beginPath()
    for (let a of angleIndicatorDegrees) {
      let pxHeight = a * (Math.PI/180) * radToPxRatio
      context.moveTo(circleCenterX - crossLineLength / 2, circleCenterY - pxHeight)
      context.lineTo(circleCenterX + crossLineLength / 2, circleCenterY - pxHeight)
    }
    context.stroke()


  }

}
export const attitudeIndicator = new AttitudeIndicator()
