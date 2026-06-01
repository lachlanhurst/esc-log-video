import { adcPair } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'

class AdcPairVisualization extends DataTypeVisualization {
  _labelSize: number = 22
  _valueSize: number = 48
  _subLabelSize: number = 20
  _unitSize: number = 24
  _padding: number = 6

  constructor() {
    super(
      'ADC side by side',
      [adcPair],
      []
    )
    this._width = 380
    this._height = 116
  }

  width(seriesVideoDetail: SeriesVideoDetail): number {
    const visOptions = seriesVideoDetail.visualizationOptions as any
    if (visOptions.adcDisplayMode === 'pads' || visOptions.adcDisplayMode === 'padsLight') {
      return 190
    }
    return this._width
  }

  height(seriesVideoDetail: SeriesVideoDetail): number {
    const visOptions = seriesVideoDetail.visualizationOptions as any
    const displayMode = visOptions.adcDisplayMode === 'pads' || visOptions.adcDisplayMode === 'padsLight'
      ? visOptions.adcDisplayMode
      : 'raw'
    let h = displayMode !== 'raw' ? 130 : (this._subLabelSize + this._padding + this._valueSize)
    if (seriesVideoDetail.name.length !== 0) {
      h += this._labelSize + this._padding
    }
    return h
  }

  _adcLevelColor(value: number): string {
    return value > 2.5 ? '#2d8fda' : '#8a8a8a'
  }

  _drawPadView(
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions,
    baseX: number,
    baseY: number,
    renderZoneWidth: number,
    padDisplayMode: 'pads' | 'padsLight',
    hatchPattern: CanvasPattern | null,
    leftValue: number,
    rightValue: number
  ) {
    // SVG-inspired geometry (viewBox 120x100) scaled to our canvas.
    const padTop = 6
    const boardWidth = 150
    const boardHeight = 117
    const valueBaseline = padTop + boardHeight
    const srcWidth = 120
    const srcHeight = 100

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      context.beginPath()
      context.moveTo(x + r, y)
      context.lineTo(x + w - r, y)
      context.quadraticCurveTo(x + w, y, x + w, y + r)
      context.lineTo(x + w, y + h - r)
      context.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      context.lineTo(x + r, y + h)
      context.quadraticCurveTo(x, y + h, x, y + h - r)
      context.lineTo(x, y + r)
      context.quadraticCurveTo(x, y, x + r, y)
      context.closePath()
    }



    const visWidth = 190
    const visX = this.absX(Math.max(0, (renderZoneWidth - visWidth) / 2), baseX)
    const x0 = visX + (visWidth - boardWidth) / 2
    const y0 = this.absY(padTop, baseY)

    const sx = boardWidth / srcWidth
    const sy = boardHeight / srcHeight
    const X = (svgX: number) => x0 + svgX * sx
    const Y = (svgY: number) => y0 + svgY * sy

    const buildPadPath = (isLeft: boolean) => {
      context.beginPath()
      if (isLeft) {
        context.moveTo(X(20), Y(72))
        context.lineTo(X(20), Y(34))
        context.bezierCurveTo(X(20), Y(18), X(28), Y(12), X(42), Y(12))
        context.lineTo(X(50), Y(12))
        context.bezierCurveTo(X(54), Y(12), X(56), Y(18), X(56), Y(28))
        context.lineTo(X(56), Y(72))
      } else {
        context.moveTo(X(64), Y(72))
        context.lineTo(X(64), Y(28))
        context.bezierCurveTo(X(64), Y(18), X(66), Y(12), X(70), Y(12))
        context.lineTo(X(78), Y(12))
        context.bezierCurveTo(X(92), Y(12), X(100), Y(18), X(100), Y(34))
        context.lineTo(X(100), Y(72))
      }
      context.closePath()
    }

    const drawPadReflection = (isLeft: boolean) => {
      const reflectionCenterGap = 8
      context.save()
      buildPadPath(isLeft)
      context.clip()
      context.beginPath()

      if (isLeft) {
        context.moveTo(X(24), Y(36))
        context.bezierCurveTo(X(24), Y(22), X(32), Y(16), X(44), Y(16))
        context.lineTo(X(56 - reflectionCenterGap), Y(16))
      } else {
        context.moveTo(X(64 + reflectionCenterGap), Y(16))
        context.lineTo(X(76), Y(16))
        context.bezierCurveTo(X(88), Y(16), X(96), Y(22), X(96), Y(36))
      }

      context.lineWidth = 2 * Math.min(sx, sy)
      context.strokeStyle = 'rgba(255,255,255,0.12)'
      context.lineCap = 'round'
      context.stroke()
      context.restore()
    }

    if (padDisplayMode === 'pads') {
      // Background: trace exact outer contour of both pads merged, offset outward by M.
      // Left pad outer corners: top-left bezier (20,34)→C(20,18)(28,12)→(42,12)
      //                         bottom corners are straight/square.
      // Right pad outer corners: top-right bezier (78,12)→C(92,12)(100,18)→(100,34)
      const M = 7
      context.beginPath()
      context.moveTo(X(20 - M), Y(72 + M))                                          // bottom-left
      context.lineTo(X(20 - M), Y(34))                                              // up left outer edge
      context.bezierCurveTo(X(20 - M), Y(18 - M), X(28 - M), Y(12 - M), X(42), Y(12 - M)) // top-left (exact left pad curvature offset out)
      context.lineTo(X(78), Y(12 - M))                                              // across top
      context.bezierCurveTo(X(92 + M), Y(12 - M), X(100 + M), Y(18 - M), X(100 + M), Y(34)) // top-right (exact right pad curvature offset out)
      context.lineTo(X(100 + M), Y(72 + M))                                         // down right outer edge
      context.closePath()                                                            // bottom straight back
      context.fillStyle = '#2a2f35'
      context.fill()

      context.lineWidth = 2
      context.strokeStyle = '#434a53'
      context.stroke()
    }

    const drawPad = (isLeft: boolean, padValue: number) => {
      buildPadPath(isLeft)
      if (padDisplayMode === 'pads') {
        context.fillStyle = this._adcLevelColor(padValue)
        context.fill()
      } else if (padValue > 2.5 && hatchPattern) {
        context.fillStyle = hatchPattern
        context.fill()
      }

      context.lineWidth = padDisplayMode === 'padsLight' ? 2 : 3 * Math.min(sx, sy)
      context.strokeStyle = padDisplayMode === 'padsLight' ? videoOptions.foregroundColor : '#d9d9d9'
      context.lineJoin = 'round'
      context.stroke()
    }

    // Left and right pads based directly on the provided SVG path profile.
    drawPad(true, leftValue)
    drawPad(false, rightValue)

    if (padDisplayMode === 'pads') {
      // Reflections only inside each pad, with wider center spacing.
      drawPadReflection(true)
      drawPadReflection(false)

      // Center divider positioned at exact board center.
      const dividerX = X(58.5)
      const dividerY = Y(12)
      const dividerW = 3 * sx
      const dividerH = 60 * sy
      drawRoundedRect(dividerX, dividerY, dividerW, dividerH, Math.max(1, 1.5 * Math.min(sx, sy)))
      context.fillStyle = '#1b1f24'
      context.fill()
    }

    context.fillStyle = videoOptions.foregroundColor
    context.textAlign = 'center'
    // @ts-ignore
    context.letterSpacing = '-1px'
    context.font = `19px Helvetica`
    context.fillText(
      `${leftValue.toFixed(1)} V`,
      X(38),
      this.absY(valueBaseline, baseY)
    )
    context.fillText(
      `${rightValue.toFixed(1)} V`,
      X(82),
      this.absY(valueBaseline, baseY)
    )
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    cache.maxLabel = '0.00'
    for (const point of logFileDataSeries.data) {
      const valueA = Array.isArray(point) ? Number(point[0] || 0) : 0
      const valueB = Array.isArray(point) ? Number(point[1] || 0) : 0
      const textA = seriesVideoDetails.unit.format(valueA)
      const textB = seriesVideoDetails.unit.format(valueB)
      if (textA.length > cache.maxLabel.length) {
        cache.maxLabel = textA
      }
      if (textB.length > cache.maxLabel.length) {
        cache.maxLabel = textB
      }
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
    const values = Array.isArray(value) ? value : [0, 0]
    const adc1 = Number(values[0] || 0)
    const adc2 = Number(values[1] || 0)
    const visOptions = seriesVideoDetail.visualizationOptions as any
    const displayMode = visOptions.adcDisplayMode === 'pads' || visOptions.adcDisplayMode === 'padsLight'
      ? visOptions.adcDisplayMode
      : 'raw'
    const invert = Boolean(visOptions.adcInvert)

    const leftValue = invert ? adc2 : adc1
    const rightValue = invert ? adc1 : adc2

    let y = 0

    if (seriesVideoDetail.name.length !== 0) {
      y += this._labelSize
      context.beginPath()
      context.fillStyle = videoOptions.foregroundColor
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-2px'
      context.font = `${this._labelSize}px Helvetica`
      context.fillText(
        seriesVideoDetail.name,
        this.absX(0, baseX),
        this.absY(y, baseY)
      )
      y += this._padding
    }

    if (displayMode !== 'raw') {
      const renderZoneWidth = Math.max(0, context.canvas.width - (2 * baseX))
      let hatchPattern: CanvasPattern | null = null

      if (displayMode === 'padsLight') {
        const tile = new OffscreenCanvas(10, 10)
        const tileCtx = tile.getContext('2d')! as OffscreenCanvasRenderingContext2D
        const gradient = tileCtx.createLinearGradient(0, 0, tile.width, tile.height)
        const colorStops = [
          [0, videoOptions.backgroundColor],
          [0.35, videoOptions.backgroundColor],
          [0.35, videoOptions.foregroundColor],
          [0.5, videoOptions.foregroundColor],
          [0.5, videoOptions.backgroundColor],
          [0.85, videoOptions.backgroundColor],
          [0.85, videoOptions.foregroundColor],
          [1, videoOptions.foregroundColor],
        ]
        colorStops.forEach(([stop, color]) => gradient.addColorStop(stop as number, color as string))
        tileCtx.fillStyle = gradient
        tileCtx.fillRect(0, 0, tile.width, tile.height)
        hatchPattern = context.createPattern(tile, 'repeat')
      }

      this._drawPadView(
        context,
        videoOptions,
        baseX,
        baseY + y,
        renderZoneWidth,
        displayMode,
        hatchPattern,
        leftValue,
        rightValue
      )
      return
    }

    const valuesTop = y
    const valuesBaseline = valuesTop + this._subLabelSize + this._padding + this._valueSize - 12

    const columnWidth = 176
    const firstX = this.absX(0, baseX)
    const secondX = this.absX(columnWidth + 16, baseX)
    const valueWidth = 104
    const valueRightX = valueWidth
    const unitX = valueRightX + 6

    const drawAdcValue = (label: string, text: string, x: number) => {
      context.fillStyle = videoOptions.foregroundColor
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-1px'
      context.font = `${this._subLabelSize}px Helvetica`
      context.fillText(label, x, this.absY(valuesTop + this._subLabelSize, baseY))

      context.fillStyle = videoOptions.foregroundColor
      context.textAlign = 'end'
      // @ts-ignore
      context.letterSpacing = '-3px'
      context.font = `bold ${this._valueSize}px Helvetica`
      context.fillText(text, x + valueRightX, this.absY(valuesBaseline, baseY), valueWidth)

      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-2px'
      context.font = `${this._unitSize}px Helvetica`
      context.fillText(seriesVideoDetail.unit.symbol, x + unitX, this.absY(valuesBaseline, baseY), 48)
    }

    drawAdcValue('ADC1', seriesVideoDetail.unit.format(leftValue), firstX)
    drawAdcValue('ADC2', seriesVideoDetail.unit.format(rightValue), secondX)
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
    const maskPadding = 4
    const visOptions = seriesVideoDetail.visualizationOptions as any
    const displayMode = visOptions.adcDisplayMode === 'pads' || visOptions.adcDisplayMode === 'padsLight'
      ? visOptions.adcDisplayMode
      : 'raw'

    context.fillStyle = 'white'

    let y = 0
    if (seriesVideoDetail.name.length !== 0) {
      context.textAlign = 'start'
      // @ts-ignore
      context.letterSpacing = '-2px'
      context.font = `${this._labelSize}px Helvetica`
      const labelBounds = this.labelBounds(seriesVideoDetail.name, this._labelSize, context)
      context.fillRect(
        this.absX(baseX, labelBounds[0] - maskPadding),
        this.absY(baseY, labelBounds[1] - maskPadding),
        labelBounds[2] + 2 * maskPadding,
        labelBounds[3] + 2 * maskPadding
      )
      y += this._labelSize + this._padding
    }

    const valuesTop = y
    const valuesBottom = displayMode !== 'raw'
      ? valuesTop + 6 + 117 + 7
      : valuesTop + this._subLabelSize + this._padding + this._valueSize
    const width = displayMode !== 'raw' ? 190 : this._width
    const renderZoneWidth = Math.max(0, context.canvas.width - (2 * baseX))
    const contentX = displayMode !== 'raw'
      ? this.absX(Math.max(0, (renderZoneWidth - width) / 2), baseX)
      : this.absX(0, baseX)

    context.fillRect(
      contentX - maskPadding,
      this.absY(valuesTop, baseY) - maskPadding,
      width + 2 * maskPadding,
      (valuesBottom - valuesTop) + 2 * maskPadding
    )
  }
}

export const adcPairVisualization = new AdcPairVisualization()
