import { LogFileData } from './logFileData'
import { exampleFileSpecification } from './fileSpecifications/example'

export const getDummyData = <LogFileData>() => {
  let lfd = new LogFileData(exampleFileSpecification)

  let timeCol = exampleFileSpecification.columnForLabel('t')!
  let speedCol = exampleFileSpecification.columnForLabel('speed_kph')!
  let motorAmpsCol = exampleFileSpecification.columnForLabel('c_motor')!
  let batteryAmpsCol = exampleFileSpecification.columnForLabel('c_battery')!
  let inputVoltsCol = exampleFileSpecification.columnForLabel('v_battery')!

  let latCol = exampleFileSpecification.columnForLabel('pos_lat')!
  let longCol = exampleFileSpecification.columnForLabel('pos_lon')!


  let timeSeriesIndex = lfd.addSeries(timeCol)
  let speedSeriesIndex = lfd.addSeries(speedCol)
  let motorAmpsSeriesIndex = lfd.addSeries(motorAmpsCol)
  let batteryAmpsSeriesIndex = lfd.addSeries(batteryAmpsCol)
  let inputVoltsSeriesIndex = lfd.addSeries(inputVoltsCol)

  let latSeriesIndex = lfd.addSeries(latCol)
  let longSeriesIndex = lfd.addSeries(longCol)


  for (let i = 0; i < 500; i++) {
    lfd.addSeriesValue(timeSeriesIndex, i * 10)
    lfd.addSeriesValue(speedSeriesIndex, 16 + 5 * Math.sin(i * 0.03) + 4 * Math.sin(i * 0.08) + Math.random() * 2)

    lfd.addSeriesValue(motorAmpsSeriesIndex, 75 + Math.random() * 10)
    lfd.addSeriesValue(batteryAmpsSeriesIndex, 25 + Math.random() * 3)

    lfd.addSeriesValue(inputVoltsSeriesIndex, 54 + Math.random() - i * 0.1)

    // lfd.addSeriesValue(motorTempSeriesIndex, 23 + Math.random() * 3 + i * 0.1)
    // lfd.addSeriesValue(mosTempSeriesIndex, 23 + Math.random() * 5 + i * 0.08)

    // lfd.addSeriesValue(pitchSeriesIndex, Math.sin(i * 0.03) / 3)
    // lfd.addSeriesValue(rollSeriesIndex, Math.sin(i * 0.05 + 1) / 3)
    // lfd.addSeriesValue(yawSeriesIndex, Math.sin(i * 0.07) / 3)

    lfd.addSeriesValue(
      latSeriesIndex,
      (60 + Math.cos(i * 0.025 + 1) / 3 + Math.cos(i * 0.009 + 1) / 12 + Math.random() / 180) / 100
    )
    lfd.addSeriesValue(
      longSeriesIndex,
      (20 + Math.sin(i * 0.035) / 3 + Math.sin(i * 0.008) / 12 + Math.random() / 140) / 100
    )
  }

  lfd.buildDerivedSeries()
  lfd.buildCompositeSeries()

  return lfd
}
