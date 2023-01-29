import { allSingleValueDataTypes } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'


class LabelAndValue extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 64
  _unitSize: number = 32
  _padding: number = 6

  constructor() {
    super(
      'Label and value text',
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
    h += this._valueSize
    h -= 18  // text sizing is hard
    return h
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions): void
  {
    // min max values are used to find the biggest width
    // of text that will be rendered so we can make sure the
    // mask doesn't cut off the value string
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
    // @ts-ignore
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
    // @ts-ignore
    context.letterSpacing = "-2px"
    context.font = `${this._unitSize}px Helvetica`
    context.fillText(
      `${seriesVideoDetail.unit.symbol}`,
      this.absX(0, baseX) + 200 + 2,
      this.absY(y, baseY),
      100
    )

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

    context.fillStyle = "white"

    let y = 0
    if (seriesVideoDetail.name.length != 0) {
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = "-2px"
      context.font = `${this._labelSize}px Helvetica`
      let labelSize = this.labelBounds(seriesVideoDetail.name, this._labelSize, context)
      let labelX = this.absX(baseX, labelSize[0] - maskPadding)
      let labelWidth = labelSize[2] + 2 * maskPadding
      let labelHeight = labelSize[3]  + 2 * maskPadding
      let labelY = this.absY(baseY, labelSize[1] - maskPadding)

      context.fillRect(labelX, labelY, labelWidth, labelHeight)

      y += this._padding
    }

    y += this._labelSize
    y += - 18 // -18 cause text size is hard

    context.textAlign = 'end'
    // @ts-ignore
    context.letterSpacing = "-5px"
    context.font = `bold ${this._valueSize}px Helvetica`

    let valueTextStart = 200

    let valueTextMin = seriesVideoDetail.unit.format(cache.min)
    let valueTextMax = seriesVideoDetail.unit.format(cache.max)
    let lbMin = this.labelBounds(`${valueTextMin}`, this._valueSize, context)
    let lbMax = this.labelBounds(`${valueTextMax}`, this._valueSize, context)
    let lbFinalX = Math.min(lbMin[0], lbMax[0])
    let lbFinalWidth = Math.max(lbMin[2], lbMax[2])

    let valueBoxX = this.absX(baseX, valueTextStart + lbFinalX) - maskPadding
    let valueBoxY = this.absY(baseY, lbMax[1] + y) - maskPadding
    let valueBoxW = lbFinalWidth + maskPadding * 2
    let valueBoxH = lbMax[3] + maskPadding * 2

    context.fillStyle = "white"
    context.fillRect(
      valueBoxX,
      valueBoxY,
      valueBoxW,
      valueBoxH
    )

    context.textAlign = 'start'
    // @ts-ignore
    context.letterSpacing = "-2px"
    context.font = `${this._unitSize}px Helvetica`
    
    let unitTextSize = this.labelBounds(seriesVideoDetail.unit.symbol, this._unitSize, context)

    context.fillRect(
      this.absX(baseX, valueTextStart + unitTextSize[0] + 2),
      valueBoxY + valueBoxH / 2 - maskPadding,
      unitTextSize[2] + maskPadding,
      valueBoxH / 2 + maskPadding
    )
  }

}
export const labelAndValue = new LabelAndValue()
