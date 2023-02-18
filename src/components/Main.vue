<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed, toRaw } from 'vue'
import { QuestionOutlined, InboxOutlined, VideoCameraAddOutlined, PlusOutlined, WarningOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { Compact } from '@ckpack/vue-color'

import RenderCanvas from './RenderCanvas.vue'
import MaskCanvas from './MaskCanvas.vue'
import SeriesDetail from './SeriesDetail.vue'
import ReleaseNotes from './ReleaseNotes.vue'
import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { VideoOptions } from '../lib/videoOptions'

import { LogFileReader } from '../lib/logFile'
import { LogFileData } from '../lib/logFileData'
import { LogFileDataHelper } from '../lib/logFileDataHelper'
import { getVisualization } from '../lib/visualizationUtils'
import { getDummyData } from '../lib/dummyData'
import { FileSpecificationColumn } from '../lib/fileSpecification'


const version = __APP_VERSION__

onMounted(() => {

  let dummyData = getDummyData()
  logFileData.value = dummyData
  logFileDataHelper.value.logFileData = dummyData

  logFileData.value.fileSpecification.defaultColumns.forEach((col) => {
    addColumnAsDefaultToSvd(col)
  })
})

const renderCanvas = ref()
const maskCanvas = ref()

const startRender = () => {
  renderCanvas.value?.startRecording()
}

const cancelRender = () => {
  renderCanvas.value?.stopRecording()
}

const saveMask = () => {
  maskCanvas.value?.saveMask()
}

const rightPanelTabList = [
  {
    key: 'video',
    tab: 'Video',
  },
  {
    key: 'mask',
    tab: 'Mask',
  },
]

const rightPanelTabKey = ref('video')
const onRightPanelTabChange = (value: string) => {
  if (rendering.value) {
    return
  }
  rightPanelTabKey.value = value

  if (value == "mask") {
    renderCanvas.value!.stopPlaying()
  }
}

const fileList = ref([])
const reading = ref(false)
const readingProgress = ref(0)
const renderProgress = ref<number>(0.0)
const rendering = ref<boolean>(false)
const renderProgressMessage = ref<string>("")
const logFileData = ref<null | LogFileData>(null)
const logFileDataHelper = ref<LogFileDataHelper>(new LogFileDataHelper())

const handleChange = info => {
  if (info.file.status !== 'uploading') {

    renderCanvas.value!.stopPlaying()

    let logReader = new LogFileReader(info)
    logReader.setProgressCallback((value) => {
      readingProgress.value = value * 100
    })

    reading.value = true
    logReader.read().then((data) => {
      data.buildDerivedSeries()
      data.buildCompositeSeries()
      reading.value = false
      readingProgress.value = 0
      logFileData.value = data
      logFileDataHelper.value.logFileData = data
      logFileDataHelper.value.reset()

      // need to remove the series video details that are currently displayed, but
      // no longer have data because a new dataset was reloaded.
      let indexesToRemove: number[] = []
      for (let i = 0; i < seriesVideoDetails.value.length; i++) {
        let svd = seriesVideoDetails.value[i]
        if (data.seriesColumns.includes(toRaw(svd.column))) {
          // then it's ok, this column can stay
        } else {
          // then we need to remove it
          indexesToRemove.push(i)
        }
      }
      // remove in reverse order otherwise the indexes will be wrong
      indexesToRemove.reverse()
      for (const index of indexesToRemove) {
        seriesVideoDetails.value.splice(index, 1)
      }

      // add in the default columns, but only if there are no existing columns
      // displayed
      if (seriesVideoDetails.value.length == 0) {
        logFileData.value.fileSpecification.defaultColumns.forEach((col) => {
          addColumnAsDefaultToSvd(col)
        })
      }

      renderCanvas.value!.startPlaying()
    })


  }
  if (info.file.status === 'done') {
    message.success(`${info.file.name} file opened successfully`)
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file open failed.`)
  }
}

const upload = async (file) => {
  // dummy upload function as we don't upload the file
  return true
}

const uploadFiles = ({ onSuccess, onError, file }) => {
  upload(file)
    .then(() => {
      onSuccess(null, file);
    })
    .catch(() => {
      console.log('error');
    })
}

const videoOptions = reactive<VideoOptions>({
  fps: 30,
  backgroundColor: "black",
  foregroundColor: "white",
})

const updateColor = (color, colorAttribute) => {
  videoOptions[colorAttribute] = color.hex
}

/**
 * Gets a new series column to add to the UI. Logic is
 * to always add a column that hasn't already been added
 * unless there are no new columns to add (then add existing)
 * column.
 */
const getNewSeriesColumn = () => {
  let maybeCol: FileSpecificationColumn | null = null
  for (const col of logFileData.value!.seriesColumns) {
    if (col.hidden) {
      continue
    }
    maybeCol = col
    let alreadyAdded = false
    for(const svd of seriesVideoDetails.value) {
      if (toRaw(svd.column) == toRaw(col) ) {
        alreadyAdded = true
      }
    }
    if (alreadyAdded) {
      continue
    }
    return col
  }
  return maybeCol
}

const seriesVideoDetails = ref<SeriesVideoDetail[]>([])
const addSeriesVideoDetails = () => {
  if (logFileData.value == null) {
    return
  }
  addColumnAsDefaultToSvd(getNewSeriesColumn()!)
}

const addColumnAsDefaultToSvd = (column: FileSpecificationColumn) => {
  seriesVideoDetails.value.push({
    column: column,
    unit: column.unit,
    name: column.name,
    visualization: getVisualization(column.dataType),
    visualizationOptions: {},
  })
}

const handleRenderProgress = (e) => {
  renderProgress.value = e.value
  renderProgressMessage.value = e.message
}

const handleRenderStarted = () => {
  rendering.value = true
}

const handleRenderStopped = () => {
  rendering.value = false
}

const availableColumns = computed(() => {
  return logFileData.value?.seriesColumns.filter(col => !col.hidden)
})

watch(
  () => videoOptions,
  (newValue, oldValue) => {
    logFileDataHelper.value.fps = newValue.fps
  },
  { deep: true }
)


</script>


<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo" >
        <video-camera-add-outlined class="heading"/>
      </div>
      <a-row type="flex" justify="space-between" align="center" class="header-rhs">
        <a-row align="bottom">
          <div class="heading">ESC Log Video</div>
          <a-col class="version-label" style="line-height: normal;">
            <a-row >v{{ version }}</a-row>
          </a-col>
        </a-row>

        <div>
          <a-col style="line-height: normal; color: white; padding-top: 18px;">
            <a-space direction="vertical" size="12">
              <a-row justify="end">
                <a href="https://github.com/lachlanhurst/esc-log-video">GitHub repo</a>
              </a-row>
              <a-row justify="end">©2023 Lachlan Hurst</a-row>
            </a-space>
          </a-col>
        </div>
      </a-row>
    </a-layout-header>
    <a-layout-content :style="{ background: '#f4f4f4', }">
      <a-row type="flex" :style="{ padding: '8px 8px', height: '100%', width: '100%' }" :gutter="[8, 8]">
        <a-col class="gutter-row" flex="500px" style="height: 100%">
          <div style="overflow-y: scroll; width: 100%; height: 100%">
            <a-row type="flex" :gutter="[0, 8]">

              <a-card style="width: 100%">
                <template #title>
                  <div class="ant-card-head-title" style="padding-top: 0px; padding-bottom: 0px;">Log file</div>
                  <div class="ant-card-meta-description" style="padding-top: 0px; font-weight: 400; font-size: 14px; margin-top: -8px;">
                    Open a CSV log file generated by the VESC Tool
                  </div>
                </template>
                <a-space direction="vertical" style="width: 100%">
                  <a-upload-dragger
                    v-model:fileList="fileList"
                    name="file"
                    :multiple="false"
                    :showUploadList="false"
                    :customRequest="uploadFiles"
                    :disabled="rendering"
                    @change="handleChange"
                  >
                    <a-row align="middle" justify="center">
                      <a-space>
                        <p class="ant-upload-drag-icon" style="margin-bottom: 0px">
                          <inbox-outlined v-if="rendering" :style="{ color: 'rgba(0, 0, 0, 0.25)'}"></inbox-outlined>
                          <inbox-outlined v-else="rendering"></inbox-outlined>
                        </p>
                        <p class="ant-upload-text">Click or drag file to this area to open</p>
                      </a-space>
                    </a-row>
                  </a-upload-dragger>
                  <a-progress v-if="reading" :percent="readingProgress" status="active" :showInfo="false"/>
                  <a-typography-text v-if="logFileData == null" type="secondary">
                    Download a sample log file
                    <a href="2023-01-08_17-32-11.csv" download>here</a>.
                  </a-typography-text>
                  <a-typography-text v-else type="secondary">
                    Successfully loaded {{ logFileData.seriesList.length }} series with {{ logFileData.seriesList[0].data.length }} entries
                  </a-typography-text>
                </a-space>
              </a-card>

              <a-card title="Video details" style="width: 100%">
                <a-form v-if="!rendering" :model="videoOptions" :label-col="{style: {width: '130px'}}" :wrapper-col="{span: 14}">
                  <a-form-item label="Framerate (fps)" class="form-item-less-margin">
                    <a-input-number
                      v-model:value="videoOptions.fps"
                      :min="1"
                      :max="120"
                    />
                  </a-form-item>
                  <a-form-item label="Background color" class="form-item-less-margin">
                    <Compact :modelValue="videoOptions.backgroundColor" class="color-picker" @update:modelValue="updateColor($event, 'backgroundColor')"/>
                  </a-form-item>
                  <a-form-item label="Text color" class="form-item-less-margin">
                    <Compact :modelValue="videoOptions.foregroundColor" class="color-picker" @update:modelValue="updateColor($event, 'foregroundColor')"/>
                  </a-form-item>

                </a-form>
                <a-form v-else :model="videoOptions" :label-col="{style: {width: '130px'}}" :wrapper-col="{span: 14}" style="height: 188px;">
                  <a-row class="flex" align="middle" justify="center" style="height: 100%">
                    <a-col align="center">
                      <div>
                        <warning-outlined :style="{ fontSize: '64px', color: 'rgba(0, 0, 0, 0.25)'}" />
                      </div>
                      <div style="padding-top:10px">
                        <a-typography-text type="secondary">
                          No changes permitted while rendering
                        </a-typography-text>
                      </div>
                    </a-col>
                  </a-row>
                </a-form>
              </a-card>

              <div style="width: 100%">
                <a-card  style="width: 100%">
                  <template #title>
                    <div class="ant-card-head-title" style="padding-top: 0px; padding-bottom: 0px;">Data series</div>
                    <div class="ant-card-meta-description" style="padding-top: 0px; font-weight: 400; font-size: 14px; margin-top: -8px;">Log data series rendered to video</div>
                  </template>
                  <template #extra>
                    <a-button type="default" :disabled="rendering" @click="addSeriesVideoDetails">
                      <template #icon>
                        <PlusOutlined />
                      </template>
                      Add series
                    </a-button>
                  </template>
                </a-card>

                <SeriesDetail
                  v-for="seriesVideoDetail in seriesVideoDetails"
                  :series-video-detail="seriesVideoDetail"
                  :seriesVideoDetailList="seriesVideoDetails"
                  :available-columns="availableColumns"
                  :disabled="rendering"
                  style="margin-bottom: 1px; margin-top: 1px;"
                />

                <Empty v-if="!logFileData" :image="Empty.PRESENTED_IMAGE_SIMPLE">
                  <template #description>
                    <span>
                      No data - open log file to view available series
                    </span>
                  </template>
                </Empty>
                <Empty v-else-if="seriesVideoDetails.length == 0" :image="Empty.PRESENTED_IMAGE_SIMPLE">
                  <template #description>
                    <span>
                      No data - add a new data series using the button below
                    </span>
                  </template>
                </Empty>
              </div>
              <ReleaseNotes></ReleaseNotes>
            </a-row>
          </div>

        </a-col>
        <a-col class="gutter-row row" flex="auto" style="height: 100%">

          <a-card style="width: 100%" :tab-list="rightPanelTabList" :active-tab-key="rightPanelTabKey" size="small"
            @tabChange="key => onRightPanelTabChange(key)">
            <!-- <template #tabBarExtraContent>
              <a-button shape="circle">
                <template #icon>
                  <QuestionOutlined />
                </template>
              </a-button>
            </template> -->
          </a-card>

          <template v-if="rightPanelTabKey === 'video'">
            <a-row class="flex render-background" align="middle" justify="center">
              <div>
                <RenderCanvas
                  ref="renderCanvas"
                  :videoOptions="videoOptions"
                  :seriesVideoDetails="seriesVideoDetails"
                  :logFileDataHelper="logFileDataHelper"
                  @render-progress="handleRenderProgress($event)"
                  @render-started="handleRenderStarted()"
                  @render-stopped="handleRenderStopped()"
                />
              </div>
            </a-row>

            <a-row type="flex" align="middle" :gutter="[8, 8]" style="padding: 8px 0px">
              <a-col class="gutter-row">
                <a-button @click="startRender" :disabled="rendering" type="primary">
                  <template #icon>
                    <PlayCircleOutlined />
                  </template>
                  Create video
                </a-button>
              </a-col>
              <a-col class="gutter-row">
                <a-button @click="cancelRender" :disabled="!rendering">
                  Cancel
                </a-button>
              </a-col>

              <a-col flex="auto" class="gutter-row">
                <div> {{ renderProgressMessage }}</div>
                <a-progress :percent="renderProgress * 100" status="active" :showInfo="false" trailColor="white"/>
              </a-col>

            </a-row>

          </template>
          <template v-if="rightPanelTabKey === 'mask'">
            <a-row class="flex render-background" align="middle" justify="center">
              <div>
                <MaskCanvas
                  ref="maskCanvas"
                  :videoOptions="videoOptions"
                  :seriesVideoDetails="seriesVideoDetails"
                  :logFileDataHelper="logFileDataHelper"
                />
              </div>
            </a-row>

            <a-row type="flex" align="middle" :gutter="[8, 8]" style="padding: 8px 0px">
              <a-col class="gutter-row">
                <a-button @click="saveMask">
                  Save mask image
                </a-button>
              </a-col>

            </a-row>
          </template>


        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<style>
.row {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.flex {
  flex: 1;
}

.heading {
  color: white;
  /* font-family: Inter, Avenir, Helvetica, Arial, sans-serif; */
  font-size: 3.2em;
  font-weight: 800;
  letter-spacing: -4px;
}

.version-label {
  color: rgba(255, 255, 255, .35);
  letter-spacing: -1px;
  padding-left: 10px;
  padding-bottom: 14px;
  font-weight: 500;
}

.site-layout-content {
  min-height: 100%;
  padding: 12px;
  background: #fff;
}


.logo {
  float: left;
  color: white;
  padding-top: 12px;
  padding-right: 12px;
}

.header-rhs {
  font-weight: 500;
  letter-spacing: -1px;
}

.ant-layout-header {
  background-color: #2f2f2f;
}

.ant-row-rtl .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.render-background {
  background-image: linear-gradient(rgba(255, 255, 255, .75), rgba(255, 255, 255, .75)), url('../assets/checkered_background.jpg');
  overflow: scroll;
}

.color-picker {
  box-shadow: none !important;
  padding: 0px !important;
}

.form-item-less-margin {
  margin-bottom: 12px;
}

.card-titles {
  padding-top: 10px;
  padding-bottom: 10px;
}

#app .ant-card-head-title {
  padding-top: 10px;
  padding-bottom: 10px;
}

#app .ant-card-body {
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>