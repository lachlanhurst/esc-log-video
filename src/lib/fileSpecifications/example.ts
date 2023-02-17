/**
 * Example log file definition
 * 
 * This file spec is able to be loaded through the UI, but its real
 * purpose is to serve as a simple example of how to define a file
 * specification. It's also used by the dummy data that is displayed
 * when the user first loads the application.
 */

import * as dataTypes from '../dataTypes'
import * as units from '../units'
import {
  FileSpecification,
  FileSpecificationColumn,
  FileSpecificationCompositeColumn
} from '../fileSpecification'
import { PowerDerivedColumn } from './derivedColumns'


const time = new FileSpecificationColumn(
  't',
  'Time',
  dataTypes.time,
  units.millisecond,
  false
)

const speed = new FileSpecificationColumn(
  'speed_kph',
  'Speed',
  dataTypes.speed,
  units.kilometersPerHour
)

const voltage = new FileSpecificationColumn(
  'v_battery',
  'Battery Voltage',
  dataTypes.voltage,
  units.
  volt
)
const currentBattery = new FileSpecificationColumn(
  'c_battery',
  'Battery current',
  dataTypes.current,
  units.ampere
)

const currentMotor = new FileSpecificationColumn(
  'c_motor',
  'Motor current',
  dataTypes.current,
  units.ampere
)

const latitude = new FileSpecificationColumn(
  'pos_lat',
  'Latitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)
const longitude = new FileSpecificationColumn(
  'pos_lon',
  'Longitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)

const power = new PowerDerivedColumn(currentBattery, voltage)

const position = new FileSpecificationCompositeColumn(
  [longitude, latitude],
  "Position",
  dataTypes.position
)

export const exampleFileSpecification = new FileSpecification(
  'Example log file',
  ',',
  [
    time,
    speed,
    voltage,
    currentBattery,
    currentMotor,
    latitude,
    longitude
  ],
  [
    power
  ],
  [
    position
  ],
  [
    position, speed, power, currentMotor
  ]
)
