import { FileSpecification } from './fileSpecification'
import { floatControlFileSpecification } from './fileSpecifications/floatControl'
import { vescMultipleFileSpecification } from './fileSpecifications/vescMultiple'
import { vescSingleFileSpecification } from './fileSpecifications/vescSingle'

export const allFileSpecifications: FileSpecification[] = [
  vescSingleFileSpecification,
  vescMultipleFileSpecification,
  floatControlFileSpecification,
]