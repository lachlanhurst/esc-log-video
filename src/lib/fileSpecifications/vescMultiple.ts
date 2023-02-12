/**
 * VESC Log file definition for multi-VESC setups
 * 
 * We separate the single VESC and multi-VESC definitions so that the
 * battery and motor current fields can have better naming and so that
 * we can omit the single VESC data from multi-VESC files (no one will
 * want to display that data and it will only confuse users)
 */

import * as dataTypes from '../dataTypes'
import * as units from '../units'
import { FileSpecification, FileSpecificationColumn, FileSpecificationCompositeColumn } from '../fileSpecification'
import { vescColumns, vescCompositeColumns } from './vescSingle'
import { PowerDerivedColumn, VescTimeFixDerivedColumn } from './derivedColumns'

let current = new FileSpecificationColumn(
  'current_in_setup',
  'Battery current',
  dataTypes.current,
  units.ampere
)

let voltage = vescColumns.find((col) => {
  return col.label == "input_voltage"
})!
let vescTime = vescColumns.find((col) => {
  return col.label == "ms_today"
})!

// we really only include the single VESC values in here so the
// file format auto detect works
const multiVescColumns = [
  new FileSpecificationColumn(
    'current_motor_setup',
    'Motor current',
    dataTypes.current,
    units.ampere
  ),
  current,
  new FileSpecificationColumn(
    'current_in',
    'Battery current (single VESC only)',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'current_motor',
    'Motor current (single VESC only)',
    dataTypes.current,
    units.ampere
  ),
]

const derivedColumns = [
  new PowerDerivedColumn(current, voltage),
  new VescTimeFixDerivedColumn(vescTime)
]

export const vescMultipleFileSpecification = new FileSpecification(
  'VESC Log File (multiple VESC)',
  ';',
  [...vescColumns, ...multiVescColumns],
  derivedColumns,
  vescCompositeColumns,
  [
    voltage, current
  ]
)