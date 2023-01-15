import { FileSpecificationColumn } from './fileSpecification'
import { Unit } from './units'


export interface SeriesVideoDetail {
  column: FileSpecificationColumn | null;
  unit: Unit | null;
  name: string;
}
