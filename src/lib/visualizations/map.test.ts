import { assert, expect, test } from 'vitest'
import { LogFileData } from '../logFileData'

import { map } from './map'


test('Map distance calc', () => {

  const p1 = [144.95891367532107, -37.77578524354811]
  const p2 = [144.99640338510807, -37.77680203426788]

  let d_1_2 = map.distance(p1[0], p1[1], p2[0], p2[1])
  expect(d_1_2).toBeCloseTo(3.3, 1)


  // expect(fixedTimeSeries.data.length).toBe(vescTimeSeries.length)
  // // time series should now start at zero
  // expect(fixedTimeSeries.data[0]).toBe(0.0)
  // // now check the time periods between data against some manually
  // // calculated values.
  // expect(fixedTimeSeries.data[8] - fixedTimeSeries.data[7]).toBeCloseTo(0.042, 6)
  // expect(fixedTimeSeries.data[5] - fixedTimeSeries.data[4]).toBeCloseTo(0.044, 6)

})