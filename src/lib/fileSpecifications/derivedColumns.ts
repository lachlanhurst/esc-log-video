/**
 * Collection of derived columns that many be used by one or more
 * file specifications.
 */
import * as dataTypes from '../dataTypes'
import * as units from '../units'
import { FileSpecificationColumn, FileSpecificationDerivedColumn } from '../fileSpecification'

/**
 * Calculates power from current and voltage. This needs to be the battery current in order
 * to calculate the correct value.
 */
export class PowerDerivedColumn extends FileSpecificationDerivedColumn {

  constructor(currentColumn: FileSpecificationColumn, voltageColumn: FileSpecificationColumn) {
    super(
      [currentColumn, voltageColumn],
      "Power",
      dataTypes.power,
      units.watt
    )
  }

  calculateValue(input: any[]) {
    let currentCol = this._columns[0]
    let voltageCol = this._columns[1]
    let current = currentCol.unit.toBaseUnit(input[0])
    let voltage = voltageCol.unit.toBaseUnit(input[1])
    return current * voltage
  }
}
