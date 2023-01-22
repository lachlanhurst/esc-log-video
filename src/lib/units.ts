/*
Representation of different units
*/

export class Unit {
  _name: string
  _symbol: string
  _isBaseUnit: boolean

  constructor(name: string, symbol: string, isBaseUnit: boolean) {
    this._name = name
    this._symbol = symbol
    this._isBaseUnit = isBaseUnit
  }

  get name() {
    return this._name
  }

  get symbol() {
    return this._symbol
  }

  /* Base units are the units used to store data
  */
  get isBaseUnit() {
    return this._isBaseUnit
  }

  /**
   * Converts the value into a formatted string version of the value
   * @param value
   * @returns
   */
  format(value: any): string {
    return `${value}`
  }

  /**
   * Converts the given value (value must be in base units) into this unit
   * @param {*} value value to convert
   * @returns converted value in this units
   */
  convert(value) {
    if (this.isBaseUnit) {
      return value
    } else {
      throw new Error('Method "convert()" must be implemented for non base units units.')
    }
  }

  toBaseUnit(value) {
    if (this.isBaseUnit) {
      return value
    } else {
      throw new Error('Method "toBaseUnit()" must be implemented for non base units units.')
    }
  }
}

// --------------------
// Temperatures
// --------------------
class DegreeCelsius extends Unit{

  constructor() {
    super(
      'Degree Celsius',
      '°C',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

class DegreeFahrenheit extends Unit {

  constructor() {
    super(
      'Degree Fahrenheit',
      '°F',
      false
    )
  }

  convert(value) {
    return (value * 1.8) + 32
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export const degreeCelsius = new DegreeCelsius()
export const degreeFahrenheit = new DegreeFahrenheit()
export const temperatureUnits = [degreeCelsius, degreeFahrenheit]

// --------------------
// Distances
// --------------------
export class Meter extends Unit {

  constructor() {
    super(
      'Meter',
      'm',
      true
    )
  }

}

export class Kilometer extends Unit {

  constructor() {
    super(
      'Kilometer',
      'km',
      false
    )
  }

  convert(value) {
    return value / 1000.0
  }
}

export class Mile extends Unit {

  constructor() {
    super(
      'Mile',
      'mi',
      false
    )
  }

  convert(value) {
    return value * 0.000621371
  }
}

export const meter = new Meter()
export const kilometer = new Kilometer()
export const mile = new Mile()
export const distanceUnits = [kilometer, mile, meter]


// --------------------
// Speeds
// --------------------
export class MetersPerSecond extends Unit {

  constructor() {
    super(
      'Meters per second',
      'm/s',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(2)
  }
}

export class KilometersPerHour extends Unit {

  constructor() {
    super(
      'Kilometers per hour',
      'km/h',
      false
    )
  }

  convert(value) {
    return value * 3.6
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export class MilesPerHour extends Unit {

  constructor() {
    super(
      'Miles per hour',
      'mph',
      false
    )
  }

  convert(value) {
    return value * 2.23694
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export const metersPerSecond = new MetersPerSecond()
export const kilometersPerHour = new KilometersPerHour()
export const milesPerHour = new MilesPerHour()
export const speedUnits = [kilometersPerHour, milesPerHour, metersPerSecond]

// --------------------
// Acceleration
// --------------------
export class MetersPerSecondSquared extends Unit {

  constructor() {
    super(
      'Meters per second squared',
      'm/s²',
      true
    )
  }

}

export const metersPerSecondSquared = new MetersPerSecondSquared()
export const accelerationUnits = [metersPerSecondSquared]

// --------------------
// Voltage
// --------------------
export class Volt extends Unit {

  constructor() {
    super(
      'Volt',
      'V',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export const volt = new Volt()
export const voltageUnits = [volt]

// --------------------
// Current
// --------------------
export class Ampere extends Unit {

  constructor() {
    super(
      'Ampere',
      'A',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export const ampere = new Ampere()
export const currentUnits = [ampere]

// --------------------
// Electric charge
// --------------------
export class AmpereHour extends Unit {

  constructor() {
    super(
      'Ampere hour',
      'Ah',
      true
    )
  }

}

export const ampereHour = new Ampere()
export const electricChargeUnits = [ampereHour]

// --------------------
// Power
// --------------------
export class Watt extends Unit {

  constructor() {
    super(
      'Watt',
      'W',
      true
    )
  }

}

export const watt = new Watt()
export const powerUnits = [watt]

// --------------------
// Energy
// --------------------
export class WattHour extends Unit {

  constructor() {
    super(
      'Watt hour',
      'Wh',
      true
    )
  }

}

export const wattHour = new Watt()
export const energyUnits = [wattHour]

// --------------------
// Angle
// --------------------
export class Radian extends Unit {

  constructor() {
    super(
      'Radian',
      'rad',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(3)
  }
}

export class Degree extends Unit {

  constructor() {
    super(
      'Degree',
      '°',
      false
    )
  }

  toBaseUnit(value: any) {
    return value * (Math.PI / 180)
  }

  convert(value) {
    return value * (180 / Math.PI)
  }


  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export const radian = new Radian()
export const degree = new Degree()
export const angleUnits = [degree, radian]

// --------------------
// Time
// --------------------
export class Second extends Unit {

  constructor() {
    super(
      'Second',
      's',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(1)
  }
}

export class Minute extends Unit {

  constructor() {
    super(
      'Minute',
      'min',
      false
    )
  }

  convert(value) {
    return value / 60.0
  }

  format(value: any): string {
    // convert to mm:ss notation
    let minutes = Math.floor(value)
    let seconds = (value - minutes) * 60

    let extraSecondsZero = ''
    if (seconds < 10.0) {
      extraSecondsZero = '0'
    }

    return `${minutes}:${extraSecondsZero}${Math.floor(seconds)}`
  }
}

export class Millisecond extends Unit {

  constructor() {
    super(
      'Millisecond',
      'ms',
      false
    )
  }

  convert(value) {
    return value * 1000.0
  }

  toBaseUnit(value: any) {
    return value / 1000.0
  }

  format(value: any): string {
    return Number(value).toFixed(0)
  }
}

export const second = new Second()
export const minute = new Minute()
export const millisecond = new Millisecond()
export const timeUnits = [minute, second, millisecond]

// position
export class LatitudeOrLongitude extends Unit {
  /**
   * technically this is just an angle, but practically
   * we want to keep it separate from the other angle
   * stuff. This will save conversion to/from radians.
   */

  constructor() {
    super(
      'Latitude or Longitude',
      'latlong',
      true
    )
  }

  format(value: any): string {
    return Number(value).toFixed(2)
  }
}
export const latitudeOrLongitude = new LatitudeOrLongitude()