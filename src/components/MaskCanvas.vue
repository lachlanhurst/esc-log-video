<script setup lang="ts">
import { onMounted, ref, watch, PropType, defineEmits } from 'vue'

import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { LogFileDataHelper } from '../lib/logFileDataHelper'
import { MaskRenderer } from '../lib/maskRenderer'
import { VideoOptions } from '../lib/videoOptions'


const props = defineProps({
  videoOptions: Object as PropType<VideoOptions>,
  seriesVideoDetails: Array as PropType<SeriesVideoDetail[]>,
  logFileDataHelper: Object as PropType<LogFileDataHelper>,
})

const canvas = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
let maskRenderer: MaskRenderer | null = null

onMounted(() => {

  context.value = canvas.value!.getContext("2d")

  maskRenderer = new MaskRenderer(
    props.logFileDataHelper!,
    props.seriesVideoDetails!,
    context.value!,
    props.videoOptions!
  )
  maskRenderer.initialize()
  draw()
})


const draw = () => {

  let size = maskRenderer!.calculateSize()
  canvas.value!.width = size.width
  canvas.value!.height = size.height

  maskRenderer?.draw()
}


const saveMask = () => {
  let dt = canvas.value!.toDataURL('image/png');
  let link = document.createElement("a")
  link.download = "elv_mask.png";
  link.href = dt
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


watch(
  () => props.videoOptions,
  (newValue, oldValue) => {
    maskRenderer?.initialize()
    draw()
  },
  { deep: true }
)

watch(
  () => props.seriesVideoDetails,
  (newValue, oldValue) => {
    maskRenderer?.initialize()
    draw()
  },
  { deep: true }
)


watch(
  () => props.logFileDataHelper?._logFileData,
  (newValue, oldValue) => {
    maskRenderer?.initialize()
    draw()
  }
)

defineExpose({
  saveMask,
})

</script>

<template>
  <div>
    <canvas width="300" height="300" ref="canvas" id="canvas"></canvas>
  </div>
</template>

<style scoped>

</style>
