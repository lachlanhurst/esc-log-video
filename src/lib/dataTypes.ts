/*
Representation of different types of data
*/

import * as units from './units'
import { Unit } from './units'

export class DataType {
  _name: string
  _units: Unit[]

  constructor(name: string, units: Unit[]) {
    this._name = name
    this._units = units
  }

  get name() {
    return this._name
  }

  get units() {
    return this._units
  }

}

class Temperature extends DataType{
  constructor() {
    super(
      'temperature', 
      units.temperatureUnits
    )
  }
}
export const temperature = new Temperature()

class Distance extends DataType {
  constructor() {
    super(
      'distance',
      units.distanceUnits
    )
  }
}
export const distance = new Distance()

class Speed extends DataType {
  constructor() {
    super(
      'speed',
      units.speedUnits
    )
  }
}
export const speed = new Speed()

export class Time extends DataType {
  constructor() {
    super(
      'time',
      units.timeUnits
    )
  }
}
export const time = new Time()

class Voltage extends DataType {
  constructor() {
    super(
      'voltage',
      units.voltageUnits
    )
  }
}
export const voltage = new Voltage()

class Current extends DataType {
  constructor() {
    super(
      'current',
      units.currentUnits
    )
  }
}
export const current = new Current()

class Angle extends DataType {
  constructor() {
    super(
      'angle',
      units.angleUnits
    )
  }
}
export const angle = new Angle()

// Orientation as expressed by three angles
class Orientation extends DataType {
  constructor() {
    super(
      'orientation',
      units.angleUnits
    )
  }
}
export const orientation = new Orientation()


// Position as expressed by two values (latitude and longitude)
class Position extends DataType {
  constructor() {
    super(
      'position',
      [units.latitudeOrLongitude]
    )
  }
}
export const position = new Position()

export const allSingleValueDataTypes = [
  temperature,
  distance,
  speed,
  time,
  voltage,
  current,
  angle,
]
