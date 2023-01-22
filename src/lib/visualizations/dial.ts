import { allSingleValueDataTypes } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'


class Dial extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 64
  _unitSize: number = 32
  _padding: number = 6
  _dialHeight: number = 220
  _dialStartAngle: number = (180) * (Math.PI / 180)
  _dialEndAngle: number = (180 + 270 - 45) * (Math.PI / 180)
  // number of steps around the dial
  _steps: number = 8
  _stepsBetweenSteps: number = 5
  _stepLabelSize = 14

  constructor() {
    super(
      'Dial',
      allSingleValueDataTypes,
      []
    )
    this._width = 260
  }

  height(seriesVideoDetail: SeriesVideoDetail, cache: CacheObject): number {
    return this._dialHeight - 18
  }

  getSteps(steps: number, min: number, max: number) {
    // Adapted from
    //     https://mortoray.com/calculating-pleasant-stepping-values-for-a-chart/
    let oMin = min
    let oMax = max
    let desiredSteps = steps
    let range = max - min

    //find magnitude and steps in powers of 10
    let step = range / steps
    let mag10 = Math.ceil(Math.log(step) / Math.log(10))
    let baseStepSize = Math.pow(10, mag10)
    let stepSize = baseStepSize


    //find common divisions to get closer to desiredSteps
    let trySteps = [5, 4, 2, 1 ]
    for (let i = 0; i < trySteps.length; ++i )
    {
      stepSize = baseStepSize / trySteps[i];
      let ns = Math.round(range / stepSize);
      //bail if anything didn't work, We can't check float.ZeroTolernace
      // anywhere since we should work on arbitrary range values
      if (isNaN(baseStepSize) || isNaN(ns) || (ns < 1)) {
        throw new Error("Couldn't calculate good steps")
      }

      min = Math.floor(oMin / stepSize) * stepSize
      max = Math.ceil(oMax / stepSize) * stepSize
      steps = Math.round((max - min) / stepSize)

      if (steps <= desiredSteps) {
        break
      }
    }

    return {
      min: min,
      max: max,
      count: steps,
      size: stepSize,
    }
  }

  cleanText(text: string): string {
    if (text.endsWith('.0')) {
      return text.slice(0, text.length - 2)
    }
    return text
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    // need to get the min/max values
    let min = Math.min(...logFileDataSeries.data)
    let max = Math.max(...logFileDataSeries.data)
    min = seriesVideoDetails.unit.convert(min)
    max = seriesVideoDetails.unit.convert(max)

    // now get some nicer min/max values to step around
    // the dial
    cache.step = this.getSteps(this._steps, min, max)

    let deltaAngle = this._dialEndAngle - this._dialStartAngle
    let stepLineLength = 8

    let stepAngles: number[] = []
    let angle = this._dialStartAngle
    let stepCount = 0
    while (stepCount <= cache.step.count) {
      stepAngles.push(angle)
      angle += (deltaAngle / cache.step.count)
      stepCount++
    }


    let dialRadius = this._dialHeight / 2 - 2
    let dialCenterX = dialRadius + 2
    let dialCenterY = dialRadius + 2

    let dialRing = new OffscreenCanvas(this._dialHeight, this._dialHeight)
    
    let drContext = dialRing.getContext('2d')! as OffscreenCanvasRenderingContext2D

    drContext.beginPath()
    drContext.strokeStyle = videoOptions.foregroundColor
    drContext.lineWidth = 2
    drContext.arc(
      dialCenterX,
      dialCenterY,
      dialRadius,
      this._dialStartAngle,
      this._dialEndAngle,
    )
    drContext.stroke()

    // draw the little step lines around the arc
    drContext.beginPath()
    for (let stepAngle of stepAngles) {
      let xOuter = dialRadius * Math.cos(stepAngle) + 2 + dialRadius
      let yOuter =  (dialRadius * Math.sin(stepAngle) + 2 + dialRadius)
      let xInner = (dialRadius - stepLineLength) * Math.cos(stepAngle) + 2 + dialRadius
      let yInner = (dialRadius - stepLineLength) * Math.sin(stepAngle) + 2 + dialRadius
      drContext.moveTo(xOuter, yOuter)
      drContext.lineTo(xInner, yInner)
    }
    drContext.stroke()

    // draw the labels for each one of the steps
    drContext.beginPath()
    drContext.fillStyle = videoOptions.foregroundColor
    drContext.textAlign = 'center'
    // @ts-ignore
    drContext.letterSpacing = "-1px"
    drContext.font = `${this._stepLabelSize}px Helvetica`

    // draw the big steps, and labels
    for (let i = 0; i <= cache.step.count; i++) {
      let stepAngle = stepAngles[i]
      let xInner = (dialRadius - stepLineLength - 10) * Math.cos(stepAngle) + 2 + dialRadius
      let yInner = (dialRadius - stepLineLength - 10) * Math.sin(stepAngle) + 2 + dialRadius
      let stepVal = cache.step.min + i * cache.step.size
      let stepValText = seriesVideoDetails.unit.format(stepVal)
      stepValText = this.cleanText(stepValText)
      let textSize = drContext.measureText(stepValText)
      let textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent
      yInner += textHeight / 2

      drContext.fillText(
        stepValText,
        xInner,
        yInner,
      )
    }
    drContext.stroke()

    // draw the little steps
    drContext.beginPath()
    let littleStepAngle = this._dialStartAngle
    while (littleStepAngle <= this._dialEndAngle) {
      let xOuter = dialRadius * Math.cos(littleStepAngle) + 2 + dialRadius
      let yOuter = (dialRadius * Math.sin(littleStepAngle) + 2 + dialRadius)
      let xInner = (dialRadius - stepLineLength / 2) * Math.cos(littleStepAngle) + 2 + dialRadius
      let yInner = (dialRadius - stepLineLength / 2) * Math.sin(littleStepAngle) + 2 + dialRadius
      drContext.moveTo(xOuter, yOuter)
      drContext.lineTo(xInner, yInner)

      littleStepAngle += (deltaAngle / (cache.step.count * this._stepsBetweenSteps))
    }
    drContext.stroke()

    cache.dialRing = dialRing

    let arrow = new OffscreenCanvas(this._dialHeight, this._dialHeight)
    let arrowContext = arrow.getContext('2d')! as OffscreenCanvasRenderingContext2D
    arrowContext.beginPath()
    arrowContext.strokeStyle = videoOptions.foregroundColor
    arrowContext.lineWidth = 2
    arrowContext.moveTo(this._dialHeight / 2 , this._dialHeight / 2 + 5)
    arrowContext.lineTo(this._dialHeight / 2 , this._dialHeight / 2 - 5)
    arrowContext.lineTo(this._dialHeight / 2 + (dialRadius - stepLineLength) , this._dialHeight / 2)
    arrowContext.closePath()
    arrowContext.stroke()

    cache.arrow = arrow
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
    y += 10
    y += this._labelSize
    y += this._padding
    y += this._dialHeight / 2

    if (seriesVideoDetail.name.length != 0) {
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

    y += this._valueSize - 18 // -18 cause text size is hard

    context.fillStyle = videoOptions.foregroundColor
    context.textAlign = 'start'
    // @ts-ignore
    context.letterSpacing = "-2px"
    context.font = `${this._unitSize}px Helvetica`

    let unitTextSize = context.measureText(seriesVideoDetail.unit.symbol)

    context.fillText(
      `${seriesVideoDetail.unit.symbol}`,
      this.absX(this._width - this._dialHeight / 4 - unitTextSize.width - 20, baseX),
      this.absY(y, baseY),
      100
    )

    context.fillStyle = videoOptions.foregroundColor
    context.textAlign = 'end'
    // @ts-ignore
    context.letterSpacing = "-5px"
    context.font = `bold ${this._valueSize}px Helvetica`
    context.fillText(
      `${valueText}`,
      this.absX(this._width - this._dialHeight / 4 - unitTextSize.width - 22, baseX),
      this.absY(y, baseY),
      200
    )

    let w = this.width(seriesVideoDetail, cache)
    let h = this.height(seriesVideoDetail, cache)

    // draw the outer dial onto the context
    context.drawImage(
      cache.dialRing,
      this.absX(w - this._dialHeight, baseX),
      this.absY(0, baseY),
      this._dialHeight,
      this._dialHeight
    )

    let dValue = cache.step.max - cache.step.min
    let dAngle = this._dialEndAngle - this._dialStartAngle
    let angleValueRatio = dAngle / dValue
    let valueAsAngle = angleValueRatio * (value - cache.step.min) + this._dialStartAngle


    let arrowRotated = new OffscreenCanvas(this._dialHeight, this._dialHeight)
    let arrowRotatedContext = arrowRotated.getContext('2d')! as OffscreenCanvasRenderingContext2D
    arrowRotatedContext.translate(this._dialHeight / 2, this._dialHeight/2);
    arrowRotatedContext.rotate(valueAsAngle);
    arrowRotatedContext.drawImage(cache.arrow, -this._dialHeight / 2, -this._dialHeight / 2, this._dialHeight, this._dialHeight);
    arrowRotatedContext.rotate(-valueAsAngle);
    arrowRotatedContext.translate(-this._dialHeight / 2, -this._dialHeight/2);
    context.drawImage(
      arrowRotated,
      this.absX(w - this._dialHeight, baseX),
      this.absY(0, baseY),
      this._dialHeight,
      this._dialHeight
    )

  }

}
export const dial = new Dial()
