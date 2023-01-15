import { LogFileDataHelper } from './logFileDataHelper'
import { SeriesVideoDetail } from './SeriesVideoDetail'
import { VideoOptions } from './videoOptions'

interface Size {
  width: number
  height: number
}

export class CanvasRenderer {
  _logFileDataHelper: LogFileDataHelper | null
  _seriesVideoDetails: SeriesVideoDetail[]
  _context: CanvasRenderingContext2D
  _videoOptions: VideoOptions

  _outerPadding: number = 8
  _verticalBetweenPadding: number = 4

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

  calculateSize(): Size {
    let drawableSeries = this._seriesVideoDetails.filter((svd) => {
      return svd.visualization != null
    })

    if (drawableSeries.length == 0) {
      return {width: 400, height: 400}
    }
    let height = 0
    let width = 0

    height += this._outerPadding * 2
    width += this._outerPadding * 2

    let maxVisWidth = 0
    for (let svd of drawableSeries) {
      let vis = svd.visualization!
      height += vis.height

      maxVisWidth = Math.max(maxVisWidth, vis.width)

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

    let drawableSeries = this._seriesVideoDetails.filter((svd) => {
      return svd.visualization != null
    })


    for (let svd of drawableSeries) {

      let vis = svd.visualization!
      vis.draw(this._context, posX, posY)

      posY += vis.height
      posY += this._verticalBetweenPadding
    }

    if (drawableSeries.length == 0) {
      this.drawNoData()
    }

  }


}