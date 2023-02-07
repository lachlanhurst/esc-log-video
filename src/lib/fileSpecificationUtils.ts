import { FileSpecification } from './fileSpecification'
import { floatControlFileSpecification } from './fileSpecifications/floatControl'
import { vescFileSpecification } from './fileSpecifications/vesc'

export const allFileSpecifications: FileSpecification[] = [
  vescFileSpecification,
  floatControlFileSpecification,
]