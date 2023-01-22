import { LogFileDataHelper } from './logFileDataHelper'
import { SeriesVideoDetail } from './SeriesVideoDetail'
import { VideoOptions } from './videoOptions'
import { CacheObject } from './visualization'

interface Size {
  width: number
  height: number
}

export class CanvasRenderer {
  _logFileDataHelper: LogFileDataHelper | null
  _seriesVideoDetails: SeriesVideoDetail[]
  _seriesVideoDetailCaches: CacheObject[] = []
  _context: CanvasRenderingContext2D
  _videoOptions: VideoOptions

  _outerPadding: number = 8
  _verticalBetweenPadding: number = 8

  constructor(
    logFileDataHelper: LogFileDataHelper,
    seriesVideoDetails: SeriesVideoDetail[],
    context: CanvasRenderingContext2D,
    videoOptions: VideoOptions
  ) {
    this._logFileDataHelper = logFileDataHelper
    this._seriesVideoDetails = seriesVideoDetails
    this._context = context
    this._videoOptions = videoOptions
  }

  initialize():void {
    this._seriesVideoDetailCaches = []

    for (let svd of this._seriesVideoDetails) {
      let cache: CacheObject = {}
      this._seriesVideoDetailCaches.push(cache)
      let vis = svd.visualization

      let series = this._logFileDataHelper!.logFileData.seriesForColumn(svd.column)!
      vis.initialize(cache, series, svd, this._videoOptions)
    }
  }

  calculateSize(): Size {
    if (this._seriesVideoDetails.length == 0) {
      return {width: 400, height: 400}
    }
    let height = 0
    let width = 0

    height += this._outerPadding * 2
    width += this._outerPadding * 2

    let maxVisWidth = 0
    for (let i = 0; i < this._seriesVideoDetails.length; i++) {
      let svd = this._seriesVideoDetails[i]
      let cache = this._seriesVideoDetailCaches[i]

      let vis = svd.visualization!
      height += vis.height(svd, cache)

      maxVisWidth = Math.max(maxVisWidth, vis.width(svd, cache))

      if (svd != this._seriesVideoDetails[0]) {
        height += this._verticalBetweenPadding
      }
    }

    width += maxVisWidth

    return {width: width, height: height}
  }

  drawNoData() {
    this._context.beginPath()
    this._context.fillStyle = this._videoOptions.foregroundColor
    this._context.font = "30px Arial"
    this._context.fillText("Nothing to render", 20, 200)
  }

  draw() {
    console.log("canvas renderer draw")
    let posX = 0
    let posY = 0

    let size = this.calculateSize()

    this._context.clearRect(0, 0, size.width, size.height)
    this._context.beginPath()
    this._context.fillStyle = this._videoOptions.backgroundColor
    this._context.fillRect(0, 0, size.width, size.height)


    posX += this._outerPadding
    posY += this._outerPadding


    for (let i = 0; i < this._seriesVideoDetails.length; i++) {
      let svd = this._seriesVideoDetails[i]
      let cache = this._seriesVideoDetailCaches[i]

      let value = this._logFileDataHelper!.getValue(svd.column, svd.unit)
      let vis = svd.visualization!
      vis.draw(this._context, this._videoOptions, svd, cache, posX, posY, value)

      posY += vis.height(svd, cache)
      posY += this._verticalBetweenPadding
    }

    if (this._seriesVideoDetails.length == 0) {
      this.drawNoData()
    }

  }


}