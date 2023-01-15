import { DataTypeVisualization } from './dataTypesVisualization';
import { FileSpecificationColumn } from './fileSpecification'
import { Unit } from './units'


export interface SeriesVideoDetail {
  column: FileSpecificationColumn
  unit: Unit
  name: string
  visualization: DataTypeVisualization
  visualizationOptions: Object
}
