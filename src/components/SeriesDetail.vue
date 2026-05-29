<script setup lang="ts">

import { onMounted, ref, PropType, watch, reactive, computed } from 'vue'
import { CaretDownFilled, CaretUpFilled, DeleteOutlined } from '@ant-design/icons-vue'

import { FileSpecificationColumn } from '../lib/fileSpecification'
import { Unit } from '../lib/units'
import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { DataTypeVisualization } from '../lib/visualization'
import { allVisualizations, getVisualization } from '../lib/visualizationUtils'


const props = defineProps({
  availableColumns: Array as PropType<FileSpecificationColumn[]>,
  seriesVideoDetail: Object as PropType<SeriesVideoDetail>,
  seriesVideoDetailList: Object as PropType<SeriesVideoDetail[]>,
  disabled: Boolean,
})

const ensureVisualizationOptions = () => {
  if (!props.seriesVideoDetail!.visualizationOptions) {
    props.seriesVideoDetail!.visualizationOptions = {}
  }
  if (props.seriesVideoDetail!.visualization?.name === 'Map') {
    if (props.seriesVideoDetail!.visualizationOptions.mapLineWidth == null) {
      props.seriesVideoDetail!.visualizationOptions.mapLineWidth = 2
    }
  }
  if (props.seriesVideoDetail!.visualization?.name === 'ADC side by side') {
    if (!props.seriesVideoDetail!.visualizationOptions.adcDisplayMode) {
      props.seriesVideoDetail!.visualizationOptions.adcDisplayMode = 'raw'
    }
    if (props.seriesVideoDetail!.visualizationOptions.adcInvert == null) {
      props.seriesVideoDetail!.visualizationOptions.adcInvert = false
    }
  }
}

const getDefaultUnitForColumn = (column: FileSpecificationColumn) => {
  if (column.label === 'state' || column.label === 'fault_code') {
    return column.dataType.units.find(unit => unit.name === 'Decode') || column.unit
  }
  if (column.label === 'roll' || column.label === 'pitch') {
    return column.dataType.units.find(unit => unit.name === 'Degree') || column.unit
  }
  if (column.dataType.name === 'speed') {
    return column.dataType.units.find(unit => unit.symbol === 'km/h') || column.unit
  }
  return column.unit
}

const seriesOptions = computed(() => {
  return props.availableColumns!.map((col) => {
    return {
      value: col.name,
      label: col.name,
      column: col
    }
  })
})

const unitOptions = computed(() => {
  if (!props.seriesVideoDetail!.column) {
    return []
  }
  return props.seriesVideoDetail!.column!.dataType.units.map((unit) => {
    return {
      value: unit.name,
      label: unit.symbol ? `${unit.name} (${unit.symbol})` : unit.name,
      unit: unit
    }
  })
})



const visualizationOptions = computed(() => {
  if (!props.seriesVideoDetail!.column) {
    return []
  }

  let visOptions = allVisualizations.filter((vis) => {
    return vis.supportsDataType(props.seriesVideoDetail!.column!.dataType)
  }).map(vis => {
    return {
      value: vis.name,
      label: vis.name,
      visualization: vis
    }
  })
  return visOptions
})


onMounted(() => {
  if (props.availableColumns && props.availableColumns.length > 0) {
    if (props.seriesVideoDetail) {
      ensureVisualizationOptions()
      selectedSeriesName.value = props.seriesVideoDetail.column!.name
      selectedUnitName.value = props.seriesVideoDetail.unit.name
      selectedVisName.value = props.seriesVideoDetail.visualization!.name
    }
  }
})

const selectedSeriesName = ref<string | null>(null)
const seriesSelected = (seriesName) => {
  selectedSeriesName.value = seriesName
  props.seriesVideoDetail!.name = seriesName

  let so = seriesOptions.value.find(series => series.column.name == seriesName)
  props.seriesVideoDetail!.column = so!.column
  const defaultUnit = getDefaultUnitForColumn(so!.column)
  props.seriesVideoDetail!.unit = defaultUnit
  selectedUnitName.value = defaultUnit.name
  props.seriesVideoDetail!.visualization = getVisualization(so!.column.dataType)
  selectedVisName.value = props.seriesVideoDetail!.visualization.name
  ensureVisualizationOptions()
}

const selectedUnitName = ref<string | null>(null)
const unitSelected = (unitName) => {
  selectedUnitName.value = unitName

  let uo = unitOptions.value.find(unit => unit.unit.name == unitName )
  props.seriesVideoDetail!.unit = uo!.unit
}


const selectedVisName = ref<string | null>(null)
const visSelected = (visName) => {
  selectedVisName.value = visName

  let suo = visualizationOptions.value.find(su => su.visualization.name == visName)
  props.seriesVideoDetail!.visualization = suo!.visualization
  ensureVisualizationOptions()
}

const adcDisplayModeOptions = [
  { value: 'raw', label: 'Raw' },
  { value: 'pads', label: 'Refloat style' },
  { value: 'padsLight', label: 'Light style' },
]

function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}

const moveSeries = (moveBy) => {
  let index = props.seriesVideoDetailList!.indexOf(props.seriesVideoDetail!)
  let newIndex = index + moveBy
  array_move(props.seriesVideoDetailList!,index, newIndex)
}

const removeSeries = () => {
  const index = props.seriesVideoDetailList!.indexOf(props.seriesVideoDetail!);
  props.seriesVideoDetailList!.splice(index, 1)
}

watch(
  () => props.seriesVideoDetail,
  (newValue, oldValue) => {
    ensureVisualizationOptions()
    selectedUnitName.value = newValue!.unit!.name
    selectedSeriesName.value = newValue!.column!.name
    selectedVisName.value = newValue!.visualization!.name
  },
  { deep: true }
)


</script>


<template>

  <a-card>
    <a-row type="flex">
      <a-col flex="380px">
        <a-form :model="props.seriesVideoDetail" name="basic" layout="horizontal" :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }">
          <a-form-item label="Series" name="series" class="form-margin">
            <a-select :value="selectedSeriesName" @change="seriesSelected($event)" :options="seriesOptions" :disabled="props.disabled">
            </a-select>
          </a-form-item>
          <a-form-item label="Units" name="unit" class="form-margin">
            <a-select :value="selectedUnitName" @change="unitSelected($event)" :options="unitOptions" :disabled="props.disabled"/>
          </a-form-item>
          <a-form-item name="label" label="Label" class="form-margin">
            <a-input v-model:value="props.seriesVideoDetail!.name" placeholder="Series label" :disabled="props.disabled"/>
          </a-form-item>
          <a-form-item v-if="selectedVisName !== 'ADC side by side'" name="visualization" label="Display as" class="form-margin">
            <a-select :value="selectedVisName" @change="visSelected($event)" :options="visualizationOptions" :disabled="props.disabled"/>
          </a-form-item>

          <template v-if="selectedVisName === 'Map'">
            <a-form-item label="Line width" class="form-margin">
              <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                <a-input-number
                  v-model:value="props.seriesVideoDetail!.visualizationOptions.mapLineWidth"
                  :min="1" :max="5" :step="0.5"
                  :disabled="props.disabled"
                  style="width: 64px;"
                />
                <div style="flex: 1; min-width: 0; width: 100%;">
                  <a-slider
                    v-model:value="props.seriesVideoDetail!.visualizationOptions.mapLineWidth"
                    :min="1" :max="5" :step="0.5"
                    :disabled="props.disabled"
                    style="width: 100%; margin: 0;"
                  />
                </div>
              </div>
            </a-form-item>
          </template>

          <template v-if="selectedVisName === 'Dial'">
            <a-form-item label="Dial min" class="form-margin">
              <a-input-number
                v-model:value="props.seriesVideoDetail!.visualizationOptions.dialMin"
                :disabled="props.disabled"
                style="width: 100%;"
              />
            </a-form-item>
            <a-form-item label="Dial max" class="form-margin">
              <a-input-number
                v-model:value="props.seriesVideoDetail!.visualizationOptions.dialMax"
                :disabled="props.disabled"
                style="width: 100%;"
              />
            </a-form-item>
          </template>

          <template v-if="selectedVisName === 'ADC side by side'">
            <a-form-item label="Display as" class="form-margin">
              <a-select
                v-model:value="props.seriesVideoDetail!.visualizationOptions.adcDisplayMode"
                :options="adcDisplayModeOptions"
                :disabled="props.disabled"
              />
            </a-form-item>
            <a-form-item label="Invert" class="form-margin">
              <a-switch
                v-model:checked="props.seriesVideoDetail!.visualizationOptions.adcInvert"
                :disabled="props.disabled"
              />
            </a-form-item>
          </template>
        </a-form>
      </a-col>
      <a-col flex="auto" >
        <div style="display: flex; flex-direction: column; align-items: flex-end; height: 100%; width: 100%; ">
          <div class="form-margin">
            <a-tooltip title="Move series up">
              <a-button :disabled="props.seriesVideoDetail == props.seriesVideoDetailList![0] || props.disabled" @click="moveSeries(-1)">
                <template #icon>
                  <CaretUpFilled />
                </template>
              </a-button>
            </a-tooltip>
            
          </div>
          <div class="form-margin">
            <a-tooltip title="Remove this series">
              <a-button @click="removeSeries()" :disabled="props.disabled">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-tooltip>
          </div>
          
          <div class="form-margin">
            <a-tooltip title="Move series down">
              <a-button :disabled="props.seriesVideoDetail == props.seriesVideoDetailList![props.seriesVideoDetailList!.length - 1] || props.disabled" @click="moveSeries(1)">
                <template #icon>
                  <CaretDownFilled />
                </template>
              </a-button>
            </a-tooltip>
          </div>
          
        </div>
      </a-col>
      
      
    </a-row>
    
  </a-card>

</template>

<style scoped>

.form-margin {
  margin-bottom: 8px;
}

</style>