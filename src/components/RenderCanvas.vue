<script setup>
import { onMounted, ref, watch } from 'vue'

import { CanvasCapture } from 'canvas-capture'



const props = defineProps({
  msg: String,
  videoOptions: Object,
})


const count = ref(0)
const message = ref("Start capture")

const myCanvas = ref(null)
const context = ref(null)
const mp4Capture = ref(null)

onMounted(() => {

  CanvasCapture.init(myCanvas.value, {
    showRecDot: true,
    showAlerts: true,
    showDialogs: true,
    verbose: false,
    ffmpegOptions: {
      '-c:v': 'libx264',
     '-preset': 'slow',
     '-crf': '0',
     '-qp': '0',
     '-pix_fmt': 'yuv420p'
    }
  });


  context.value = myCanvas.value?.getContext("2d")

  // Start animation loop.
  return setInterval(loop, 10);
})


var colors = ["red", "blue", "yellow", "orange", "black", "white", "pink", "purple"]
var currentColor = ref(null)
let pos = ref(0)

const loop = () => {

  if (pos.value % 20 == 0) {
    currentColor.value = colors[Math.floor(Math.random() * colors.length)]
  }
  
  var contextV = context.value
  var canvas = myCanvas.value
  var vo = props.videoOptions

  const { width, height } = canvas.getBoundingClientRect()
  
  contextV.clearRect(0, 0, width, height)

  contextV.beginPath()
  contextV.fillStyle = vo.backgroundColor
  contextV.fillRect(0, 0, width, height);
  contextV.beginPath()
  contextV.fillStyle = currentColor.value
  contextV.fillRect(pos.value, pos.value, 10, 10)
  contextV.fillStyle = vo.foregroundColor
  contextV.font = "30px Arial"
  contextV.fillText("pos = " + pos.value, 100, 50)
  
  pos.value += 1


  
  // console.log(pos.value)
  // console.log(width + " " + height)

  if (pos.value + 10 > Math.min(width, height)) {
    pos.value = 0
  }

  // // Tell CanvasCapture where in the animation loop
  // // to check for hotkey presses.
  // CanvasCapture.checkHotkeys();
  // You need to do this only if you are recording a video or gif.
  if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

  
}

const startRecording = () => {
  let vo = props.videoOptions
  const mp4Options = {
    name: 'demo-mp4',
    format: CanvasCapture.MP4,
    quality: 1,
    fps: vo.fps,
    onExportProgress: (progress) => console.log(`MP4 export progress: ${progress}.`),
    onExportFinish: () => console.log(`Finished MP4 export.`),
  }

  mp4Capture.value = CanvasCapture.beginVideoRecord(mp4Options);
}

const stopRecording = () => {
  // debugger
  CanvasCapture.stopRecord();
  mp4Capture.value = undefined;
}

// watch(props.videoOptions, async (newVideoOptions, oldVideoOptions) => {
//   console.log(props.videoOptions)
// })
watch(
  () => props.videoOptions,
  (newValue, oldValue) => {
    console.log(newValue, oldValue)
  },
  { deep: true }
)


defineExpose({
  startRecording,
  stopRecording
})

</script>

<template>
  <div>
    <canvas width="300" height="300" ref="myCanvas" id="myCanvas"></canvas>
  </div>
</template>

<style scoped>

</style>
