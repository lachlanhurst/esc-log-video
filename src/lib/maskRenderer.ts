import { CanvasRenderer } from './canvasRenderer'
import { LogFileDataHelper } from './logFileDataHelper'
import { SeriesVideoDetail } from './SeriesVideoDetail'
import { VideoOptions } from './videoOptions'
import { CacheObject } from './visualization'


/**
 * Renders the mask of log file data to the html canvas
 */
export class MaskRenderer extends CanvasRenderer {

  drawNoData() {
    this._context.beginPath()
    this._context.fillStyle = this._videoOptions.foregroundColor
    this._context.font = "30px Arial"
    this._context.fillText("Nothing to render", 20, 200)
  }

  draw() {
    let posX = 0
    let posY = 0

    let size = this.calculateSize()

    this._context.clearRect(0, 0, size.width, size.height)
    this._context.beginPath()
    this._context.fillStyle = "black"
    this._context.fillRect(0, 0, size.width, size.height)


    posX += this._outerPadding
    posY += this._outerPadding

    for (let i = 0; i < this._seriesVideoDetails.length; i++) {
      let svd = this._seriesVideoDetails[i]
      let cache = this._seriesVideoDetailCaches[i]

      let value = this._logFileDataHelper!.getValue(svd.column, svd.unit)
      let vis = svd.visualization!
      vis.drawMask(this._context, this._videoOptions, svd, cache, posX, posY, value)

      posY += vis.height(svd, cache)
      posY += this._verticalBetweenPadding
    }

    if (this._seriesVideoDetails.length == 0) {
      this.drawNoData()
    }

  }

}