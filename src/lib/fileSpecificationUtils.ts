import { FileSpecification } from './fileSpecification'
import { exampleFileSpecification } from './fileSpecifications/example'
import { floatControlFileSpecification } from './fileSpecifications/floatControl'
import { metrFileSpecification1, metrFileSpecification2, metrFileSpecification4 } from './fileSpecifications/metr'
import { vescMultipleFileSpecification } from './fileSpecifications/vescMultiple'
import { vescSingleFileSpecification } from './fileSpecifications/vescSingle'

export const allFileSpecifications: FileSpecification[] = [
  vescSingleFileSpecification,
  vescMultipleFileSpecification,
  floatControlFileSpecification,
  metrFileSpecification1,
  metrFileSpecification2,
  metrFileSpecification4,
  exampleFileSpecification,
]