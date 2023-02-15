
import * as dataTypes from './../dataTypes'
import * as units from './../units'
import { FileSpecification, FileSpecificationColumn, FileSpecificationCompositeColumn, FileSpecificationDerivedColumn } from '../fileSpecification'
import { PowerDerivedColumn } from './derivedColumns'


const time = new FileSpecificationColumn(
  'elapsed',
  'Time',
  dataTypes.time,
  units.millisecond
)

const altitude = new FileSpecificationColumn(
  'altitude',
  'Altitude',
  dataTypes.distance,
  units.meter
)
// const consumption = new FileSpecificationColumn(
//   'consumption',
//   'Consumption',
//   dataTypes.energy,
//   units.wattHour
// )



let battery_current_1 = new FileSpecificationColumn(
  'current',
  'Battery current 1',
  dataTypes.current,
  units.ampere
)
let battery_current_2 = new FileSpecificationColumn(
  'current2',
  'Battery current 2',
  dataTypes.current,
  units.ampere
)
let battery_current_3 = new FileSpecificationColumn(
  'current3',
  'Battery current 3',
  dataTypes.current,
  units.ampere
)
let battery_current_4 = new FileSpecificationColumn(
  'current4',
  'Battery current 4',
  dataTypes.current,
  units.ampere
)

let motor_current_1 = new FileSpecificationColumn(
  'motorCurrent',
  'Motor current 1',
  dataTypes.current,
  units.ampere
)
let motor_current_2 = new FileSpecificationColumn(
  'motorCurrent2',
  'Motor current 2',
  dataTypes.current,
  units.ampere
)
let motor_current_3 = new FileSpecificationColumn(
  'motorCurrent3',
  'Motor current 3',
  dataTypes.current,
  units.ampere
)
let motor_current_4 = new FileSpecificationColumn(
  'motorCurrent4',
  'Motor current 4',
  dataTypes.current,
  units.ampere
)


let duty = new FileSpecificationColumn(
  'duty',
  'Duty cycle',
  dataTypes.percentage,
  units.percent
)

let voltage = new FileSpecificationColumn(
  'voltage',
  'Voltage',
  dataTypes.voltage,
  units.volt
)

let latitude = new FileSpecificationColumn(
  'latitude',
  'Latitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)
let longitude = new FileSpecificationColumn(
  'longitude',
  'Longitude',
  dataTypes.position,
  units.latitudeOrLongitude,
  true
)

const speed = new FileSpecificationColumn(
  'speed',
  'Speed',
  dataTypes.speed,
  units.kilometersPerHour
)

const position = new FileSpecificationCompositeColumn(
  [longitude, latitude],
  "Position",
  dataTypes.position
)

/**
 * Metr includes 4 current values, to get the total current this derived column simply adds
 * then together
 */
export class SummedCurrentColumn extends FileSpecificationDerivedColumn {

  constructor(
    name: string,
    currentColumns: FileSpecificationColumn[],
  ) {
    super(
      currentColumns,
      name,
      dataTypes.current,
      units.ampere
    )
  }

  calculateValue(input: any[]) {
    let sum = input.reduce((partialSum, a) => partialSum + a, 0)
    return sum
  }
}


// We need to make 4 sets of definitions for Metr files as the
// number of columns changes based on how many VESC are linked
// up

//
// For 1 VESC
//
let power1 = new PowerDerivedColumn(battery_current_1, voltage)

export const metrFileSpecification1 = new FileSpecification(
  'Metr Log File 1',
  ',',
  [
    time,
    altitude,
    duty,
    voltage,
    speed,
    battery_current_1,
    motor_current_1,
    latitude,
    longitude,
  ],
  [power1],
  [position],
  [voltage, speed, position]
)

//
// For 2 VESCs
//
let totalBatteryCurrent2 = new SummedCurrentColumn(
  "Total battery current",
  [battery_current_1, battery_current_2]
)

let totalMotorCurrent2 = new SummedCurrentColumn(
  "Total motor current",
  [motor_current_1, motor_current_2]
)

let power2 = new PowerDerivedColumn(totalBatteryCurrent2, voltage)

export const metrFileSpecification2 = new FileSpecification(
  'Metr Log File 2',
  ',',
  [
    time,
    altitude,
    duty,
    voltage,
    speed,
    battery_current_1,
    battery_current_2,
    motor_current_1,
    motor_current_2,
    latitude,
    longitude,
  ],
  [totalBatteryCurrent2, totalMotorCurrent2, power2],
  [position],
  [voltage, speed, position]
)


//
// For 4 VESCs
//
let totalBatteryCurrent4 = new SummedCurrentColumn(
  "Total battery current",
  [battery_current_1, battery_current_2, battery_current_3, battery_current_4]
)

let totalMotorCurrent4 = new SummedCurrentColumn(
  "Total motor current",
  [motor_current_1, motor_current_2, motor_current_3, motor_current_4]
)

let power4 = new PowerDerivedColumn(totalBatteryCurrent4, voltage)

export const metrFileSpecification4 = new FileSpecification(
  'Metr Log File 4',
  ',',
  [
    time,
    altitude,
    duty,
    voltage,
    speed,
    battery_current_1,
    battery_current_2,
    battery_current_3,
    battery_current_4,
    motor_current_1,
    motor_current_2,
    motor_current_3,
    motor_current_4,
    latitude,
    longitude,
  ],
  [totalBatteryCurrent4, totalMotorCurrent4, power4],
  [position],
  [voltage, speed, position]
)