import { position } from '../dataTypes'
import { LogFileDataSeries } from '../logFileData'
import { SeriesVideoDetail } from '../SeriesVideoDetail'
import { VideoOptions } from '../videoOptions'
import { CacheObject, DataTypeVisualization } from './dataTypesVisualization'

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


  initialize(
    cache: CacheObject,
    logFileDataSeries: LogFileDataSeries,
    seriesVideoDetails: SeriesVideoDetail,
    videoOptions: VideoOptions
  ): void {

    let prevPosition: number[] | null = null

    let points = logFileDataSeries.data.filter((point) => {
      if (prevPosition == null) {
        prevPosition = point
        return true
      } else if (point[0] == 0 && point[1] == 0) {
        // this seems to happen in VESC log files
        return false
      } else {
        // the vesc updates its data much faster that the GPS of the phone that is
        // recording the data, so we get many of the same coordinates. Filter these
        // out to make drawing quicker
        let isSameAsLast = prevPosition![0] == point[0] && prevPosition![0] == point[0]
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
    let baseMapContext = baseMapCanvas.getContext('2d')!
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

}
export const map = new Map()