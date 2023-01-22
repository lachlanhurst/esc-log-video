
import * as dataTypes from './../dataTypes'
import * as units from './../units'
import { FileSpecification, FileSpecificationColumn, FileSpecificationCompositeColumn } from '../fileSpecification'


// specify a few columns that will later be used in definition
// of some composite columns
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

const vescColumns = [
  new FileSpecificationColumn(
    'ms_today',
    'Time today',
    dataTypes.time,
    units.millisecond
  ),
  new FileSpecificationColumn(
    'input_voltage',
    'Input Voltage',
    dataTypes.voltage,
    units.volt
  ),
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
  new FileSpecificationColumn(
    'current_motor',
    'Motor current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'current_in',
    'Battery current',
    dataTypes.current,
    units.ampere
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
    'speed_meters_per_sec',
    'Speed',
    dataTypes.speed,
    units.metersPerSecond
  ),
  new FileSpecificationColumn(
    'gnss_gVel',
    'Speed (GPS)',
    dataTypes.speed,
    units.metersPerSecond
  ),
]


const vescCompositeColumns = [
  new FileSpecificationCompositeColumn(
    [yaw, pitch, roll],
    "Orientation",
    dataTypes.orientation
  ),
  new FileSpecificationCompositeColumn(
    [longitude, latitude],
    "Position",
    dataTypes.position
  ),
]


export const vescFileSpecification = new FileSpecification(
  'VESC Log File',
  ';',
  vescColumns,
  vescCompositeColumns,
  [
    vescColumns[0], vescColumns[2], vescColumns[5], vescColumns[4]
  ]
)