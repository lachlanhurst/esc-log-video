import { position } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from '../visualization'

class Map extends DataTypeVisualization {
  _minHeight: number = 80
  _maxHeight: number = 260

  constructor() {
    super(
      'Map',
      [position],
      []
    )
    this._width = 260
    this._height = 260
  }

  height(seriesVideoDetail: SeriesVideoDetail, cache: CacheObject): number {
    return cache.height
  }

  minMax(points) {
    var longMax = Number.MAX_VALUE * -1
    var longMin = Number.MAX_VALUE
    var latMax = Number.MAX_VALUE * -1
    var latMin = Number.MAX_VALUE
    points.forEach((p) => {
      if (longMax < p[0]) {
        longMax = p[0]
      }
      if (longMin > p[0]) {
        longMin = p[0]
      }
      if (latMax < p[1]) {
        latMax = p[1]
      }
      if (latMin > p[1]) {
        latMin = p[1]
      }
    })
    return {
      longMin: longMin,
      longMax: longMax,
      latMin: latMin,
      latMax: latMax,
    }
  }

  toRadians(angle: number): number {
    return angle * (Math.PI / 180);
  }

  buildBaseMap(cache: CacheObject, videoOptions: VideoOptions, points: number[][]): void {
    if (points.length === 0) {
      cache.longMin = 0
      cache.latMin = 0
      cache.scaleFactor = 1
      cache.width = this._width
      cache.height = this._minHeight
      cache.widthOffset = 0
      cache.baseMap = new OffscreenCanvas(cache.width, cache.height)
      cache.baseMapMask = new OffscreenCanvas(cache.width + 8, cache.height + 8)
      return
    }

    let mm = this.minMax(points)

    let dx = mm.longMax - mm.longMin
    let dy = mm.latMax - mm.latMin
    let safeDx = dx === 0 ? 0.000001 : dx
    let safeDy = dy === 0 ? 0.000001 : dy
    let scaleFactor = this._width / safeDx
    let pxHeightBasedOnWidth = scaleFactor * safeDy
    if (pxHeightBasedOnWidth > this._maxHeight) {
      scaleFactor = this._maxHeight / safeDy
    }

    let pxWidth = safeDx * scaleFactor
    cache.widthOffset = (this._width - pxWidth) / 2
    cache.longMin = mm.longMin
    cache.latMin = mm.latMin
    cache.scaleFactor = scaleFactor
    cache.width = this._width
    cache.height = Math.max(this._minHeight, Math.round(scaleFactor * safeDy))

    let baseMapCanvas = new OffscreenCanvas(cache.width, cache.height)
    let baseMapContext = baseMapCanvas.getContext('2d')! as OffscreenCanvasRenderingContext2D
    this._setCanvasScaling(baseMapContext, videoOptions.resolution.scaleFactor)
    baseMapContext.strokeStyle = videoOptions.foregroundColor
    baseMapContext.lineWidth = 1
    baseMapContext.beginPath()

    let isFirst = true
    for (let pt of points) {
      let ptX = (pt[0] - cache.longMin) * cache.scaleFactor
      let ptY = (pt[1] - cache.latMin) * cache.scaleFactor
      if (isFirst) {
        isFirst = false
        baseMapContext.moveTo(ptX + cache.widthOffset, cache.height - ptY)
      } else {
        baseMapContext.lineTo(ptX + cache.widthOffset, cache.height - ptY)
      }
    }
    baseMapContext.stroke()
    cache.baseMap = baseMapCanvas

    let maskPadding = 4
    let baseMapMaskCanvas = new OffscreenCanvas(cache.width + maskPadding * 2, cache.height + maskPadding * 2)
    let baseMapMaskContext = baseMapMaskCanvas.getContext('2d')! as OffscreenCanvasRenderingContext2D
    baseMapMaskContext.strokeStyle = 'white'
    baseMapMaskContext.lineWidth = 10
    baseMapMaskContext.lineCap = 'round'
    baseMapMaskContext.lineJoin = 'round'
    baseMapMaskContext.beginPath()

    isFirst = true
    for (let pt of points) {
      let ptX = (pt[0] - cache.longMin) * cache.scaleFactor
      let ptY = (pt[1] - cache.latMin) * cache.scaleFactor
      if (isFirst) {
        isFirst = false
        baseMapMaskContext.moveTo(ptX + cache.widthOffset + maskPadding, cache.height - ptY + maskPadding)
      } else {
        baseMapMaskContext.lineTo(ptX + cache.widthOffset + maskPadding, cache.height - ptY + maskPadding)
      }
    }
    baseMapMaskContext.stroke()
    cache.baseMapMask = baseMapMaskCanvas

    cache.baseMapRangeKey = `${cache.startTimeClipped}:${cache.endTimeClipped}`
  }

  /**
   * Calculates distance from two points (lat long points)
   * @param lon1
   * @param lat1
   * @param lon2
   * @param lat2
   * @returns distance in kms
   */
  distance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    lon1 = this.toRadians(lon1)
    lat1 = this.toRadians(lat1)
    lon2 = this.toRadians(lon2)
    lat2 = this.toRadians(lat2)

    return Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * 6371
  }

  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {
    cache.allPoints = []
    const timeSeries = cache.timeSeries
    const timeData = timeSeries ? timeSeries.data : []
    for (let i = 0; i < logFileDataSeries.data.length; i++) {
      const point = logFileDataSeries.data[i]
      const time = timeData[i]
      if (time == null) {
        continue
      }
      cache.allPoints.push({ time, point })
    }

    this.rebuildBaseMap(cache, videoOptions)

  }

  rebuildBaseMap(cache: CacheObject, videoOptions: VideoOptions): void {
    const start = cache.startTimeClipped ?? 0
    const end = cache.endTimeClipped ?? Number.MAX_VALUE

    let prevPosition: number[] | null = null
    let points = (cache.allPoints ?? [])
      .filter((entry) => entry.time >= start && entry.time <= end)
      .map((entry) => entry.point)
      .filter((point) => {
        if (point[0] == 0 && point[1] == 0) {
          return false
        } else if (prevPosition == null) {
          prevPosition = point
          return true
        } else {
          let isSameAsLast = prevPosition![0] == point[0] && prevPosition![0] == point[0]
          if (isSameAsLast) {
            return false
          }
          let distance = this.distance(prevPosition[0], prevPosition[1], point[0], point[1])
          if (distance > 0.2) {
            return false
          }
          prevPosition = point
          return !isSameAsLast
        }
      })

    this.buildBaseMap(cache, videoOptions, points)
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
    const currentRangeKey = `${cache.startTimeClipped}:${cache.endTimeClipped}`
    if (cache.baseMapRangeKey !== currentRangeKey) {
      this.rebuildBaseMap(cache, videoOptions)
    }

    let w = this.width(seriesVideoDetail, cache)
    let h = this.height(seriesVideoDetail, cache)

    // draw the basemap onto the context
    context.drawImage(cache.baseMap, this.absX(0, baseX), this.absY(0, baseY), w, h)

    let dotRadius = 3
    let ptX = (value[0] - cache.longMin) * cache.scaleFactor
    let ptY = (value[1] - cache.latMin) * cache.scaleFactor
   
    // fill the dot with background color first so we cant see line
    // inside the dot
    context.beginPath()
    context.fillStyle = videoOptions.backgroundColor
    context.arc(
      this.absX(ptX + cache.widthOffset, baseX),
      this.absY(cache.height - ptY, baseY),
      dotRadius,
      0,
      2 * Math.PI,
      false
    )
    context.fill()

    context.beginPath()
    context.strokeStyle = videoOptions.foregroundColor
    context.lineWidth = 2
    context.arc(
      this.absX(ptX + cache.widthOffset, baseX),
      this.absY(cache.height - ptY, baseY),
      dotRadius,
      0,
      2 * Math.PI,
      false
    )
    context.stroke()

    // // will draw box around this vis extents
    // context.beginPath()
    // context.strokeStyle = videoOptions.foregroundColor
    // context.rect(this.absX(0, baseX), this.absY(0, baseY), w, h)
    // context.stroke()
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
    let w = this.width(seriesVideoDetail, cache)
    let h = this.height(seriesVideoDetail, cache)

    // draw the basemap onto the context
    context.drawImage(
      cache.baseMapMask,
      this.absX(0 - maskPadding, baseX),
      this.absY(0 - maskPadding, baseY),
      w + maskPadding * 2,
      h + maskPadding * 2
    )


  }

}
export const map = new Map()