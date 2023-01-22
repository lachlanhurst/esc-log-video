import { allSingleValueDataTypes } from '../dataTypes'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'


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

}
export const labelAndValue = new LabelAndValue()
