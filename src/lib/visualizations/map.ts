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

    let prevPosition: number[] | null = null

    let points = logFileDataSeries.data.filter((point) => {
      if (point[0] == 0 && point[1] == 0) {
        // this seems to happen in VESC log files
        return false
      } else if (prevPosition == null) {
        prevPosition = point
        return true
      } else {
        // the vesc updates its data much faster that the GPS of the phone that is
        // recording the data, so we get many of the same coordinates. Filter these
        // out to make drawing quicker
        let isSameAsLast = prevPosition![0] == point[0] && prevPosition![0] == point[0]
        if (isSameAsLast) {
          return false
        }
        // calculate the distance between the last point, and the current point. If this
        // is more than 200 meters, skip it. Generally the time between points is
        // going to be fractions of a second, so the only time this would occur is when
        // there is a noisy point.
        let distance = this.distance(prevPosition[0], prevPosition[1], point[0], point[1])
        if (distance > 0.2) {
          return false
        }
        prevPosition = point
        return !isSameAsLast
      }
    })

    let mm = this.minMax(points)

    let dx = mm.longMax - mm.longMin
    let dy = mm.latMax - mm.latMin
    let scaleFactor = this._width / dx
    // let scaleFactorY = 0
    let pxHeightBasedOnWidth = scaleFactor * dy
    if (pxHeightBasedOnWidth > this._maxHeight) {
      // height to big, so use a Y based scale factor
      scaleFactor = this._maxHeight / dy
    } else {
      // then scale factor based on width gives an
      // acceptable height.
      // nothing to do here
    }

    // to keep the map centered
    let pxWidth = dx * scaleFactor
    cache.widthOffset = (this._width - pxWidth) / 2

    // cache some info that we'll need later to draw the dot
    // over the base map
    cache.longMin = mm.longMin
    cache.latMin = mm.latMin
    cache.scaleFactor = scaleFactor
    cache.width = this._width
    cache.height = Math.round(scaleFactor * dy)

    // draw the basemap and stick it in the cache, this way we
    // don't need to redraw it every frame.
    let baseMapCanvas = new OffscreenCanvas(cache.width, cache.height)
    let baseMapContext = baseMapCanvas.getContext('2d')! as OffscreenCanvasRenderingContext2D
    this._setCanvasScaling(baseMapContext, videoOptions.resolution.scaleFactor)
    baseMapContext.strokeStyle = videoOptions.foregroundColor
    baseMapContext.lineWidth = 1
    baseMapContext.beginPath()

    let isFirst = true
    // loop through all points in the filtered list
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

    let baseMapMaskCanvas = new OffscreenCanvas(cache.width + maskPadding*2, cache.height + maskPadding*2)
    let baseMapMaskContext = baseMapMaskCanvas.getContext('2d')! as OffscreenCanvasRenderingContext2D
    baseMapMaskContext.strokeStyle = "white"
    baseMapMaskContext.lineWidth = 10
    baseMapMaskContext.lineCap = 'round'
    baseMapMaskContext.lineJoin = 'round'
    baseMapMaskContext.beginPath()

    isFirst = true
    // loop through all points in the filtered list
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