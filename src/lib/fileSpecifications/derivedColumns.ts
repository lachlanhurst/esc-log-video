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


/**
 * VESC log files include a time of day column, this column isn't ideal for
 * displaying as it does not start at 0. It also resets to zero after the
 * day ends, increasing time values are not guaranteed and this causes
 * problems when we step over the series.
 *
 * This fixes the above by zeroing the start time and also patching the
 * data so that it doesn't reset at the end of the day.
 */
export class VescTimeFixDerivedColumn extends FileSpecificationDerivedColumn {
  _startVescTime: number | null
  _lastVescTime: number | null
  _lastZeroedTime: number | null

  constructor(sourceTimeColumn: FileSpecificationColumn) {
    super(
      [sourceTimeColumn],
      "Time",
      dataTypes.time,
      units.millisecond
    )
  }

  initialize(): void {
    this._startVescTime = null
    this._lastVescTime = null
    this._lastZeroedTime = null
  }

  calculateValue(input: any[]) {
    let vescTime = input[0]

    if (this._startVescTime == null) {
      // then this must be the start time
      this._startVescTime = vescTime
    }

    if (this._lastVescTime != null) {
      if (this._lastVescTime > vescTime) {
        // then it has clocked over the end of day time
        this._startVescTime = this._lastVescTime - (24.0 * 60.0 * 60.0) - this._lastZeroedTime!
      }
    }

    let zeroedTime = vescTime - this._startVescTime!

    this._lastVescTime = vescTime
    this._lastZeroedTime = zeroedTime

    return zeroedTime
  }

}