import { LogFileData } from './logFileData'
import { vescFileSpecification } from './fileSpecification'

export const getDummyData = <LogFileData>() => {
  let lfd = new LogFileData(vescFileSpecification)

  let timeCol = vescFileSpecification.columnForLabel('ms_today')!
  let motorAmpsCol = vescFileSpecification.columnForLabel('current_motor')!
  let batteryAmpsCol = vescFileSpecification.columnForLabel('current_in')!
  let inputVoltsCol = vescFileSpecification.columnForLabel('input_voltage')!
  let motorTempCol = vescFileSpecification.columnForLabel('temp_motor')!
  let mosTempCol = vescFileSpecification.columnForLabel('temp_mos_max')!

  let timeSeriesIndex = lfd.addSeries(timeCol)
  let motorAmpsSeriesIndex = lfd.addSeries(motorAmpsCol)
  let batteryAmpsSeriesIndex = lfd.addSeries(batteryAmpsCol)
  let inputVoltsSeriesIndex = lfd.addSeries(inputVoltsCol)
  let motorTempSeriesIndex = lfd.addSeries(motorTempCol)
  let mosTempSeriesIndex = lfd.addSeries(mosTempCol)

  for (let i = 0; i < 500; i++) {
    lfd.addSeriesValue(timeSeriesIndex, i * 10)

    lfd.addSeriesValue(motorAmpsSeriesIndex, 75 + Math.random() * 10)
    lfd.addSeriesValue(batteryAmpsSeriesIndex, 25 + Math.random() * 3)

    lfd.addSeriesValue(inputVoltsSeriesIndex, 54 + Math.random() - i * 0.1)

    lfd.addSeriesValue(motorTempSeriesIndex, 23 + Math.random() + i * 0.1)
    lfd.addSeriesValue(mosTempSeriesIndex, 23 + Math.random() + i * 0.08)
  }

  return lfd
}
