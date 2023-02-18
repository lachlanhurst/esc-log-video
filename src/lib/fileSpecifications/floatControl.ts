
import * as dataTypes from './../dataTypes'
import * as units from './../units'
import { FileSpecification, FileSpecificationColumn, FileSpecificationCompositeColumn } from '../fileSpecification'
import { PowerDerivedColumn } from './derivedColumns'


// specify a few columns that will later be used in definition
// of some composite columns
const roll = new FileSpecificationColumn(
  'Roll',
  'Roll',
  dataTypes.angle,
  units.degree
)
const pitch = new FileSpecificationColumn(
  'Pitch',
  'Pitch',
  dataTypes.angle,
  units.degree
)
// note: no yaw included in float control output
const current = new FileSpecificationColumn(
  'I-Battery',
  'Battery current',
  dataTypes.current,
  units.ampere
)
const voltage = new FileSpecificationColumn(
  'Voltage',
  'Voltage',
  dataTypes.voltage,
  units.volt
)
const speed = new FileSpecificationColumn(
  'Speed(km/h)',
  'Speed',
  dataTypes.speed,
  units.kilometersPerHour
)
const motorCurrent = new FileSpecificationColumn(
  'I-Motor',
  'Motor current',
  dataTypes.current,
  units.ampere
)

const floatControlColumns = [
  new FileSpecificationColumn(
    'Time(s)',
    'Time',
    dataTypes.time,
    units.second
  ),
  voltage,
  new FileSpecificationColumn(
    'T-Mosfet',
    'MOSFET temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  new FileSpecificationColumn(
    'T-Mot',
    'Motor temperature',
    dataTypes.temperature,
    units.degreeCelsius
  ),
  motorCurrent,
  new FileSpecificationColumn(
    'Requested Amps',
    'Requested motor current',
    dataTypes.current,
    units.ampere
  ),
  current,
  new FileSpecificationColumn(
    'I-FldWeak',
    'Field weakening current',
    dataTypes.current,
    units.ampere
  ),
  speed,
  new FileSpecificationColumn(
    'Distance(km)',
    'Distance',
    dataTypes.distance,
    units.kilometer
  ),
  new FileSpecificationColumn(
    'Duty%',
    'Duty cycle',
    dataTypes.percentage,
    units.percentFraction
  ),
  new FileSpecificationColumn(
    'Ah',
    'Amp hours used',
    dataTypes.electricCharge,
    units.ampereHour
  ),
  new FileSpecificationColumn(
    'Ah Charged',
    'Amp hours charged',
    dataTypes.electricCharge,
    units.ampereHour
  ),
  new FileSpecificationColumn(
    'Wh',
    'Watt hours used',
    dataTypes.energy,
    units.wattHour
  ),
  new FileSpecificationColumn(
    'Wh Charged',
    'Watt hours charged',
    dataTypes.energy,
    units.wattHour
  ),
  roll,
  pitch,
  new FileSpecificationColumn(
    'Setpoint',
    'Setpoint',
    dataTypes.angle,
    units.degree
  ),
  new FileSpecificationColumn(
    'ATR-Target',
    'ATR target',
    dataTypes.angle,
    units.degree
  ),
  new FileSpecificationColumn(
    'Carve-Target',
    'Carve target',
    dataTypes.angle,
    units.degree
  ),
  new FileSpecificationColumn(
    'Altitude(m)',
    'Altitude',
    dataTypes.distance,
    units.meter
  ),
  new FileSpecificationColumn(
    'ADC1',
    'ADC 1',
    dataTypes.voltage,
    units.volt
  ),
  new FileSpecificationColumn(
    'ADC2',
    'ADC 2',
    dataTypes.voltage,
    units.volt
  ),
]


const power = new PowerDerivedColumn(current, voltage)

// note: no yaw included in float control output, so lets just
// throw in pitch as yaw. The only vis currently implemented that
// uses this composite column doesn't use yaw anyway.
const orientation = new FileSpecificationCompositeColumn(
  [pitch, pitch, roll],
  "Orientation",
  dataTypes.orientation
)
const floatControlCompositeColumns = [
  orientation,
]


export const floatControlFileSpecification = new FileSpecification(
  'Float Control Log File',
  ',',
  floatControlColumns,
  [power],
  floatControlCompositeColumns,
  [
    orientation, speed, power, motorCurrent
  ]
)