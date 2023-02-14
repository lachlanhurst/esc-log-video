<script setup lang="ts">
import { onMounted, ref, watch, PropType, defineEmits } from 'vue'

import { CanvasCapture } from 'canvas-capture'

import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { LogFileDataHelper } from '../lib/logFileDataHelper'
import { CanvasRenderer } from '../lib/canvasRenderer'
import { VideoOptions } from '../lib/videoOptions'

const props = defineProps({
  videoOptions: Object as PropType<VideoOptions>,
  seriesVideoDetails: Array as PropType<SeriesVideoDetail[]>,
  logFileDataHelper: Object as PropType<LogFileDataHelper>,
})

interface RenderProgress {
  value: number,
  message: string
}

const emit = defineEmits<{
  (e: 'renderProgress', progress: RenderProgress): void
  (e: 'renderStarted'): void
  (e: 'renderStopped'): void
}>()

const CanvasActions = {
  playing: 'playing',
  rendering: 'rendering',
  stopped: 'stopped',
}
const canvasAction = ref('playing')


const renderCanvas = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const mp4Capture = ref<CanvasCapture.ACTIVE_CAPTURE | undefined>(undefined)
let canvasRenderer: CanvasRenderer | null = null

onMounted(() => {
  CanvasCapture.init(renderCanvas.value!, {
    showRecDot: false,
    showAlerts: true,
    showDialogs: true,
    verbose: false,
  });

  context.value = renderCanvas.value!.getContext("2d")

  canvasRenderer = new CanvasRenderer(
    props.logFileDataHelper!,
    props.seriesVideoDetails!,
    context.value!,
    props.videoOptions!
  )
  canvasRenderer.initialize()

  // draw()
  canvasAction.value = CanvasActions.playing
  playLoop()
})


const draw = () => {
  if (renderCanvas.value) {
    let size = canvasRenderer!.calculateSize()
    renderCanvas.value!.width = size.width
    renderCanvas.value!.height = size.height

    canvasRenderer?.draw()
  } else {
    console.log("null canvas draw")
  }

}

const playLoop = () => {

  setTimeout(function () { //throttle requestAnimationFrame to fps

    if (canvasAction.value != CanvasActions.playing) {
      return
    }

    draw()

    let incrementSuccess = props.logFileDataHelper!.incrementCurrentTime()
    if (!incrementSuccess) {
      props.logFileDataHelper!.reset()
    }


    requestAnimationFrame(playLoop)
  }, 1000 / props.videoOptions!.fps)

}

const renderLoop = () => {
  draw()

  emit(
    'renderProgress',
    {
      value: props.logFileDataHelper!.progress(),
      message: "Rendering frames"
    }
  )

  // You need to do this only if you are recording a video or gif.
  if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

  let incrementSuccess = props.logFileDataHelper!.incrementCurrentTime()

  if (canvasAction.value == CanvasActions.rendering && incrementSuccess) {
    requestAnimationFrame(renderLoop)
  }

  if (!incrementSuccess) {
    stopRecording()
  }

}


const startRecording = () => {
  emit('renderStarted')
  // switch canvas to render loop
  canvasAction.value = CanvasActions.rendering
  // set the logFileDataHelper back to the start time
  props.logFileDataHelper!.reset()

  // Start render loop, will automatically finish when render is complete
  setTimeout(renderLoop, 0)

  let vo = props.videoOptions!
  const mp4Options = {
    name: 'elv_video',
    format: CanvasCapture.MP4,
    quality: 1,
    fps: vo.fps,
    onExportProgress: (progress) => {
      emit(
        'renderProgress',
        {value: progress, message: "Generating MP4"}
      )
    },
    onExportFinish: () => {
      emit(
        'renderProgress',
        { value: 0, message: "" }
      )
      emit('renderStopped')
    },
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

const stopPlaying = () => {
  canvasAction.value = CanvasActions.stopped
}

const startPlaying = () => {
  canvasAction.value = CanvasActions.playing
  playLoop()
}

watch(
  () => props.videoOptions,
  (newValue, oldValue) => {
    canvasRenderer?.initialize()
    if (canvasAction.value != CanvasActions.rendering) {
      draw()
    }
  },
  { deep: true }
)

watch(
  () => props.seriesVideoDetails,
  (newValue, oldValue) => {
    canvasRenderer?.initialize()
    if (canvasAction.value != CanvasActions.rendering) {
      draw()
    }
  },
  { deep: true }
)


watch(
  () => props.logFileDataHelper?._logFileData,
  (newValue, oldValue) => {
    canvasRenderer?.initialize()
    if (canvasAction.value != CanvasActions.rendering) {
      draw()
    }
  }
)

defineExpose({
  startRecording,
  stopRecording,
  startPlaying,
  stopPlaying,
})

</script>

<template>
  <div>
    <canvas width="300" height="300" ref="renderCanvas" id="renderCanvas"></canvas>
  </div>
</template>

<style scoped>

</style>
