import { DataType, time } from '../dataTypes'
import { angleIndicator } from './angleIndicator'
import { attitudeIndicator } from './attitudeIndicator'
import { barChart } from './barChart'
import { DataTypeVisualization, onlyTime } from './dataTypesVisualization'
import { labelAndValue } from './labelAndValue'
import { map } from './map'
import { sparkline } from './sparkline'


export const allVisualizations: DataTypeVisualization[] = [
  attitudeIndicator,
  map,
  angleIndicator,
  labelAndValue,
  barChart,
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