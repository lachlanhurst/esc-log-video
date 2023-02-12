import { assert, expect, test } from 'vitest'
import { LogFileData } from '../logFileData'

import { vescSingleFileSpecification } from './vescSingle'


test('VESC time fix', () => {
  // taken from actual VESC log file
  let vescTimeSeries = [
    86399778,
    86399824,
    86399876,
    86399919,
    86399978,
    22,
    75,
    114,
    156,
  ]

  // build a log file data set to test against
  let lfd = new LogFileData(vescSingleFileSpecification)
  let timeCol = vescSingleFileSpecification.columnForLabel('ms_today')!
  let timeSeriesIndex = lfd.addSeries(timeCol)
  for (const t of vescTimeSeries) {
    lfd.addSeriesValue(timeSeriesIndex, t)
  }
  lfd.buildDerivedSeries()
  lfd.buildCompositeSeries()

  let fixedTimeSeries = lfd.seriesList[1]

  expect(fixedTimeSeries.data.length).toBe(vescTimeSeries.length)
  // time series should now start at zero
  expect(fixedTimeSeries.data[0]).toBe(0.0)
  // now check the time periods between data against some manually
  // calculated values.
  expect(fixedTimeSeries.data[8] - fixedTimeSeries.data[7]).toBeCloseTo(0.042, 6)
  expect(fixedTimeSeries.data[5] - fixedTimeSeries.data[4]).toBeCloseTo(0.044, 6)

})