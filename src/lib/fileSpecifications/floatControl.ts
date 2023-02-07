
import * as dataTypes from './../dataTypes'
import * as units from './../units'
import { FileSpecification, FileSpecificationColumn, FileSpecificationCompositeColumn } from '../fileSpecification'


// specify a few columns that will later be used in definition
// of some composite columns
let roll = new FileSpecificationColumn(
  'Roll',
  'Roll',
  dataTypes.angle,
  units.degree
)
let pitch = new FileSpecificationColumn(
  'Pitch',
  'Pitch',
  dataTypes.angle,
  units.degree
)
// note: no yaw included in float control output

const floatControlColumns = [
  new FileSpecificationColumn(
    'Time(s)',
    'Time',
    dataTypes.time,
    units.second
  ),
  new FileSpecificationColumn(
    'Voltage',
    'Voltage',
    dataTypes.voltage,
    units.volt
  ),
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
  new FileSpecificationColumn(
    'I-Motor',
    'Motor current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'Requested Amps',
    'Requested motor current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'I-Battery',
    'Battery current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'I-FldWeak',
    'Field weakening current',
    dataTypes.current,
    units.ampere
  ),
  new FileSpecificationColumn(
    'Speed(km/h)',
    'Speed',
    dataTypes.speed,
    units.kilometersPerHour
  ),
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

// note: no yaw included in float control output, so lets just
// throw in pitch as yaw. The only vis currently implemented that
// uses this composite column doesn't use yaw anyway.
const floatControlCompositeColumns = [
  new FileSpecificationCompositeColumn(
    [pitch, pitch, roll],
    "Orientation",
    dataTypes.orientation
  ),
]


export const floatControlFileSpecification = new FileSpecification(
  'Float Control Log File',
  ',',
  floatControlColumns,
  floatControlCompositeColumns,
  [
    floatControlColumns[0], floatControlColumns[8], floatControlColumns[4]
  ]
)