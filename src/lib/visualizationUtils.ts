import { DataType, time } from './dataTypes'
import { angleIndicator } from './visualizations/angleIndicator'
import { attitudeIndicator } from './visualizations/attitudeIndicator'
import { barChart } from './visualizations/barChart'
import { DataTypeVisualization, onlyTime } from './visualization'
import { dial } from './visualizations/dial'
import { labelAndValue } from './visualizations/labelAndValue'
import { map } from './visualizations/map'
import { sparkline } from './visualizations/sparkline'


export const allVisualizations: DataTypeVisualization[] = [
  attitudeIndicator,
  map,
  angleIndicator,
  labelAndValue,
  barChart,
  dial,
  sparkline,
  onlyTime,
]


class NoVisualization extends DataTypeVisualization {

  constructor() {
    super(
      'No Viz',
      [time],
      []
    )
    this._width = 200
    this._height = 50
  }

}
const noViz = new NoVisualization()


export const getVisualization = (dataType: DataType): DataTypeVisualization => {
  for (let vis of allVisualizations) {
    if (vis.supportsDataType(dataType)) {
      return vis
    }
  }

  return noViz
}