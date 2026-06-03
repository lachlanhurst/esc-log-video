import { angle } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'

class RollPitchIndicator extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 118
  _padding: number = 4
  _drawingOffsetY: number = 2

  constructor() {
    super(
      'Onewheel style',
      [angle],
      []
    )
    this._width = 176
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    let y: number = 0
    if (seriesVideoDetail.name.length !== 0) {
      y += this._labelSize
      y += this._padding
    }
    y += this._drawingOffsetY
    y += this._valueSize
    return y
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    if (!cache.rollImage) {
      let rollImage = new Image()
      rollImage.src = `${import.meta.env.BASE_URL}assets/roll.svg`
      cache.rollImage = rollImage
    }

    if (!cache.pitchImage) {
      let pitchImage = new Image()
      pitchImage.src = `${import.meta.env.BASE_URL}assets/pitch.svg`
      cache.pitchImage = pitchImage
    }
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
    value = seriesVideoDetail.unit.toBaseUnit(value)

    const renderZoneWidth = Math.max(0, context.canvas.width - (2 * baseX))
    const labelX = this.absX(0, baseX)
    const drawX = this.absX(Math.max(0, (renderZoneWidth - this._width) / 2), baseX)

    let y = 0
    if (seriesVideoDetail.name.length != 0) {
      y += this._labelSize
      context.beginPath()
      context.fillStyle = videoOptions.foregroundColor
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-2px'
      context.font = `${this._labelSize}px Helvetica`
      context.fillText(
        seriesVideoDetail.name,
        labelX,
        this.absY(y, baseY),
      )
      y += this._padding
    }

    y += this._drawingOffsetY

    let circleDiameter = this._valueSize
    let circleRadius = circleDiameter / 2
    let circleCenterX = drawX + this._width / 2
    let circleCenterY = this.absY(baseY, y + circleRadius)

    const columnLabel = seriesVideoDetail.column?.label
    const boardImage = columnLabel === 'roll' ? cache.rollImage : cache.pitchImage
    if (boardImage && boardImage.complete && boardImage.naturalWidth > 0) {
      const imageRotation = columnLabel === 'pitch' ? -value : value

      context.save()
      context.translate(circleCenterX, circleCenterY)
      context.rotate(imageRotation)

      const baseScale = columnLabel === 'roll' ? 0.90 : 1.30
      const maxSize = circleDiameter * baseScale
      const imageAspect = boardImage.naturalWidth / boardImage.naturalHeight
      let drawW = maxSize
      let drawH = maxSize
      if (imageAspect > 1) {
        drawH = maxSize / imageAspect
      } else {
        drawW = maxSize * imageAspect
      }

      context.drawImage(boardImage, -drawW / 2, -drawH / 2, drawW, drawH)
      context.restore()
    }
  }

  drawMask(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    seriesVideoDetail: SeriesVideoDetail,
    cache: CacheObject,
    baseX: number,
    baseY: number,
    value: any
  ): void {
    let maskPadding = 4
    const renderZoneWidth = Math.max(0, context.canvas.width - (2 * baseX))
    const labelX = this.absX(0, baseX)
    const drawX = this.absX(Math.max(0, (renderZoneWidth - this._width) / 2), baseX)

    context.fillStyle = 'white'

    let y = 0
    if (seriesVideoDetail.name.length != 0) {
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-2px'
      context.font = `${this._labelSize}px Helvetica`
      let labelSize = context.measureText(seriesVideoDetail.name)
      let labelMaskX = labelX
      let labelWidth = labelSize.width
      let labelHeight = labelSize.actualBoundingBoxAscent + labelSize.actualBoundingBoxDescent
      let labelY = this.absY(baseY, y + this._labelSize - labelSize.actualBoundingBoxAscent)

      labelMaskX -= maskPadding
      labelY -= maskPadding
      labelHeight += 2 * maskPadding
      labelWidth += 2 * maskPadding

      context.fillRect(labelMaskX, labelY, labelWidth, labelHeight)

      y += this._labelSize
      y += this._padding
    }

    y += this._drawingOffsetY

    let circleDiameter = this._valueSize
    let circleRadius = circleDiameter / 2

    let circleCenterX = drawX + this._width / 2
    let circleCenterY = this.absY(baseY, y + circleRadius)

    context.beginPath()
    context.arc(circleCenterX, circleCenterY, circleRadius + maskPadding, 0, Math.PI * 2)
    context.fill()
  }
}

export const rollPitchIndicator = new RollPitchIndicator()
