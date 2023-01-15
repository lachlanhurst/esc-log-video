<script setup lang="ts">

import { onMounted, ref, PropType, watch, reactive, computed } from 'vue'
import { CaretDownFilled, CaretUpFilled, DeleteOutlined } from '@ant-design/icons-vue'

import { FileSpecificationColumn } from '../lib/fileSpecification'
import { Unit } from '../lib/units'
import { SeriesVideoDetail } from '../lib/seriesVideoDetail'
import { allVisualizations, DataTypeVisualization, getVisualization } from '../lib/dataTypesVisualization'


const props = defineProps({
  availableColumns: Array as PropType<FileSpecificationColumn[]>,
  seriesVideoDetail: Object as PropType<SeriesVideoDetail>,
  seriesVideoDetailList: Object as PropType<SeriesVideoDetail[]>,
})

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
      label: `${unit.name} (${unit.symbol})`,
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
      selectedSeriesName.value = props.seriesVideoDetail.column!.name
      selectedUnitName.value = props.seriesVideoDetail.column!.dataType.units[0].name
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
  props.seriesVideoDetail!.unit = so!.column.unit
  selectedUnitName.value = so!.column.unit.name
  props.seriesVideoDetail!.visualization = getVisualization(so!.column.dataType)
  selectedVisName.value = props.seriesVideoDetail!.visualization.name
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
}

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
    console.log(newValue)
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
            <a-select :value="selectedSeriesName" @change="seriesSelected($event)" :options="seriesOptions">
            </a-select>
          </a-form-item>
          <a-form-item label="Units" name="unit" class="form-margin">
            <a-select :value="selectedUnitName" @change="unitSelected($event)" :options="unitOptions" />
          </a-form-item>
          <a-form-item name="label" label="Label" class="form-margin">
            <a-input v-model:value="props.seriesVideoDetail!.name" placeholder="Series label" />
          </a-form-item>
          <a-form-item name="visualization" label="Display as" class="form-margin">
            <a-select :value="selectedVisName" @change="visSelected($event)" :options="visualizationOptions"/>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col flex="auto" >
        <div style="display: flex; flex-direction: column; align-items: flex-end; height: 100%; width: 100%; ">
          <div class="form-margin">
            <a-tooltip title="Move series up">
              <a-button :disabled="props.seriesVideoDetail == props.seriesVideoDetailList![0]" @click="moveSeries(-1)">
                <template #icon>
                  <CaretUpFilled />
                </template>
              </a-button>
            </a-tooltip>
            
          </div>
          <div class="form-margin">
            <a-tooltip title="Remove this series">
              <a-button @click="removeSeries()">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-tooltip>
          </div>
          
          <div class="form-margin">
            <a-tooltip title="Move series down">
              <a-button :disabled="props.seriesVideoDetail == props.seriesVideoDetailList![props.seriesVideoDetailList!.length-1]" @click="moveSeries(1)">
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