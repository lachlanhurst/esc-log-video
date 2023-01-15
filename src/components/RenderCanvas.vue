<script setup lang="ts">
import { onMounted, ref, watch, PropType } from 'vue'

import { CanvasCapture } from 'canvas-capture'

import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { LogFileDataHelper } from '../lib/logFileDataHelper'

const props = defineProps({
  videoOptions: Object,
  seriesVideoDetails: Array as PropType<SeriesVideoDetail[]>,
  logFileDataHelper: Object as PropType<LogFileDataHelper>,
})

const CanvasActions = {
  playing: 'playing',
  rendering: 'rendering',
  stopped: 'stopped',
}
const canvasAction = ref('playing')


const renderCanvas = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const mp4Capture = ref <CanvasCapture.ACTIVE_CAPTURE | undefined>(undefined)

onMounted(() => {
  CanvasCapture.init(renderCanvas.value!, {
    showRecDot: true,
    showAlerts: true,
    showDialogs: true,
    verbose: false,
  });

  context.value = renderCanvas.value!.getContext("2d")

  playLoop()
})


var currentColor = ref("red")
let pos = ref(0)

const draw = () => {
  var contextV = context.value!
  var canvas = renderCanvas.value
  var vo = props.videoOptions

  const { width, height } = canvas!.getBoundingClientRect()

  contextV.clearRect(0, 0, width, height)

  contextV.beginPath()
  contextV.fillStyle = vo!.backgroundColor
  contextV.fillRect(0, 0, width, height);
  contextV.beginPath()
  contextV.fillStyle = currentColor.value
  contextV.fillRect(pos.value, pos.value, 10, 10)
  contextV.fillStyle = vo!.foregroundColor
  contextV.font = "30px Arial"
  contextV.fillText("pos = " + pos.value, 100, 50)

  let lfdh = props.logFileDataHelper!
  if (lfdh.timeSeries) {
    let txt = lfdh.getValue(lfdh.timeSeries.column, lfdh.timeSeries.column.unit)
    contextV.fillText(`t = ${txt}`, 30, 90)
  }
}

const playLoop = () => {
  if (canvasAction.value != CanvasActions.playing) {
    return
  }

  draw()

  let incrementSuccess = props.logFileDataHelper!.incrementCurrentTime()
  if (!incrementSuccess) {
    props.logFileDataHelper!.reset()
  }

  pos.value += 1

  requestAnimationFrame(playLoop)
}

const renderLoop = () => {

  draw()

  pos.value += 1

  // You need to do this only if you are recording a video or gif.
  if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

  let incrementSuccess = props.logFileDataHelper!.incrementCurrentTime()

  if (canvasAction.value == CanvasActions.rendering && incrementSuccess) {
    setTimeout(renderLoop, 0)
  }

  if (!incrementSuccess) {
    stopRecording()
  }

}


const startRecording = () => {
  // switch canvas to render loop
  canvasAction.value = CanvasActions.rendering
  // set the logFileDataHelper back to the start time
  props.logFileDataHelper!.reset()

  // Start render loop, will automatically finish when render is complete
  setTimeout(renderLoop, 0)

  let vo = props.videoOptions!
  const mp4Options = {
    name: 'demo-mp4',
    format: CanvasCapture.MP4,
    quality: 1,
    fps: vo.fps,
    onExportProgress: (progress) => console.log(`MP4 export progress: ${progress}.`),
    onExportFinish: () => console.log(`Finished MP4 export.`),
    // ffmpegOptions: {
    //   '-c:v': 'libx264',
    //   '-preset': 'slow',
    //   '-crf': '10',
    //   '-qp': '0',
    //   '-pix_fmt': 'yuv420p'
    // }
  }

  mp4Capture.value = CanvasCapture.beginVideoRecord(mp4Options);
}

const stopRecording = () => {
  canvasAction.value = CanvasActions.stopped

  CanvasCapture.stopRecord();
  mp4Capture.value = undefined;
}

// watch(
//   () => props.videoOptions,
//   (newValue, oldValue) => {
//     if (rendering.value == false) {
//       draw()
//     }
//   },
//   { deep: true }
// )


defineExpose({
  startRecording,
  stopRecording
})

</script>

<template>
  <div>
    <canvas width="300" height="300" ref="renderCanvas" id="renderCanvas"></canvas>
  </div>
</template>

<style scoped>

</style>
