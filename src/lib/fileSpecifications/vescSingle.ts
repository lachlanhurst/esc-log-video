/**
 * VESC Log file definition for single VESC setups
 * 
 * We separate the single VESC and multi-VESC definitions so that the
 * battery and motor current fields can have better naming and so that
 * we can omit the single VESC data from multi-VESC files (no one will
 * want to display that data and it will only confuse users)
 */

import * as dataTypes from '../dataTypes'
import * as units from '../units'
import {
  FileSpecification,
  FileSpecificationColumn,
  FileSpecificationCompositeColumn,
  FileSpecificationDerivedColumn
} from '../fileSpecification'
import { PowerDerivedColumn, VescTimeFixDerivedColumn } from './derivedColumns'


// specify a few columns that will later be used in definition
// of some composite columns

// hide the time series recorded by the VESC, instead we'll
// show the user the fixed time (derived column added below)
let vescTime = new FileSpecificationColumn(
  'ms_today',
  'Time today',
  dataTypes.time,
  units.millisecond,
  true
)
let voltage = new FileSpecificationColumn(
  'input_voltage',
  'Input Voltage',
  dataTypes.voltage,
  units.volt
)
let current = new FileSpecificationColumn(
  'current_in',
  'Battery current',
  dataTypes.current,
  units.ampere
)
let roll = new FileSpecificationColumn(
  'roll',
  'Roll',
  dataTypes.angle,
  units.radian
)
let pitch = new FileSpecificationColumn(
  'pitch',
  'Pitch',
  dataTypes.angle,
  units.radian
)
let yaw = new FileSpecificationColumn(
  'yaw',
  'Yaw',
  dataTypes.angle,
  units.radian
)
let latitude = new FileSpecificationColumn(
  'gnss_lat',
  'Latitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)
let longitude = new FileSpecificationColumn(
  'gnss_lon',
  'Longitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)
let speed = new FileSpecificationColumn(
  'speed_meters_per_sec',
  'Speed',
  dataTypes.speed,
  units.metersPerSecond
)


export const vescColumns = [
  vescTime,
  voltage,
  new FileSpecificationColumn(
    'temp_mos_max',
    'MOSFET temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  new FileSpecificationColumn(
    'temp_motor',
    'Motor temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  speed,
  new FileSpecificationColumn(
    'duty_cycle',
    'Duty cycle',
    dataTypes.percentage,
    units.percentFraction
  ),
  new FileSpecificationColumn(
    'battery_level',
    'Battery level',
    dataTypes.percentage,
    units.percentFraction
  ),
  new FileSpecificationColumn(
    'amp_hours_used',
    'Amp hours used',
    dataTypes.electricCharge,
    units.ampereHour
  ),
  new FileSpecificationColumn(
    'amp_hours_charged',
    'Amp hours charged',
    dataTypes.electricCharge,
    units.ampereHour
  ),
  new FileSpecificationColumn(
    'watt_hours_used',
    'Watt hours used',
    dataTypes.energy,
    units.wattHour
  ),
  new FileSpecificationColumn(
    'watt_hours_charged',
    'Watt hours charged',
    dataTypes.energy,
    units.wattHour
  ),
  new FileSpecificationColumn(
    'accX',
    'Acceleration X',
    dataTypes.acceleration,
    units.metersPerSecondSquared
  ),
  new FileSpecificationColumn(
    'accY',
    'Acceleration Y',
    dataTypes.acceleration,
    units.metersPerSecondSquared
  ),
  new FileSpecificationColumn(
    'accZ',
    'Acceleration Z',
    dataTypes.acceleration,
    units.metersPerSecondSquared
  ),
  new FileSpecificationColumn(
    'encoder_position',
    'Encoder position',
    dataTypes.angle,
    units.degree
  ),
  roll,
  pitch,
  yaw,
  latitude,
  longitude,
  new FileSpecificationColumn(
    'gnss_alt',
    'Altitude',
    dataTypes.distance,
    units.meter
  ),
  new FileSpecificationColumn(
    'gnss_gVel',
    'Speed (GPS)',
    dataTypes.speed,
    units.metersPerSecond
  ),
]


const vescSingleColumns = [
  current,
  new FileSpecificationColumn(
    'current_motor',
    'Motor current',
    dataTypes.current,
    units.ampere
  ),
]


let power = new PowerDerivedColumn(current, voltage)

const derivedColumns = [
  power,
  new VescTimeFixDerivedColumn(vescTime)
]


const position = new FileSpecificationCompositeColumn(
  [longitude, latitude],
  "Position",
  dataTypes.position
)


export const vescCompositeColumns = [
  new FileSpecificationCompositeColumn(
    [yaw, pitch, roll],
    "Orientation",
    dataTypes.orientation
  ),
  position,
]


export const vescSingleFileSpecification = new FileSpecification(
  'VESC Log File (single VESC)',
  ';',
  [...vescColumns, ...vescSingleColumns],
  derivedColumns,
  vescCompositeColumns,
  [
    position, speed, power
  ]
)
