<template>
  <div class="chart simple-chart">
    <svg viewBox="0 0 640 320" role="img" aria-label="energy chart">
      <template v-if="chartKind === 'pie'">
        <g transform="translate(320 160)">
          <path
            v-for="slice in pieSlices"
            :key="slice.name"
            :d="slice.path"
            :fill="slice.color"
          >
            <title>{{ slice.name }}: {{ formatValue(slice.value) }}</title>
          </path>
          <circle v-if="isDonut" :r="innerRadius" fill="#fff" />
        </g>
        <g class="chart-legend" :transform="`translate(${legendX} 44)`">
          <g v-for="(slice, index) in pieSlices" :key="slice.name" :transform="`translate(0 ${index * 24})`">
            <rect width="10" height="10" rx="2" :fill="slice.color" />
            <text x="18" y="10">{{ slice.name }}</text>
          </g>
        </g>
      </template>

      <template v-else-if="isHorizontalBar">
        <g class="chart-axis">
          <line :x1="plot.left" :y1="plot.bottom" :x2="plot.right" :y2="plot.bottom" />
          <line :x1="plot.left" :y1="plot.top" :x2="plot.left" :y2="plot.bottom" />
        </g>
        <g v-for="(item, index) in horizontalBars" :key="item.name">
          <text class="chart-label chart-label-left" :x="plot.left - 8" :y="item.y + item.height * 0.68">
            {{ item.name }}
          </text>
          <rect
            :x="plot.left"
            :y="item.y"
            :width="item.width"
            :height="item.height"
            rx="4"
            :fill="item.color"
          >
            <title>{{ item.name }}: {{ formatValue(item.value) }}</title>
          </rect>
          <text class="chart-label" :x="plot.left + item.width + 8" :y="item.y + item.height * 0.68">
            {{ formatValue(item.value) }}
          </text>
        </g>
      </template>

      <template v-else>
        <g class="chart-axis">
          <line :x1="plot.left" :y1="plot.bottom" :x2="plot.right" :y2="plot.bottom" />
          <line :x1="plot.left" :y1="plot.top" :x2="plot.left" :y2="plot.bottom" />
        </g>
        <g class="chart-grid">
          <line
            v-for="tick in 4"
            :key="tick"
            :x1="plot.left"
            :x2="plot.right"
            :y1="plot.bottom - tick * (plot.height / 5)"
            :y2="plot.bottom - tick * (plot.height / 5)"
          />
        </g>
        <g v-for="serie in normalizedSeries" :key="serie.name || serie.type">
          <template v-if="serie.type === 'line'">
            <polyline class="chart-line" :points="linePoints(serie)" :stroke="serie.color" />
            <circle
              v-for="point in lineDots(serie)"
              :key="`${serie.name}-${point.x}-${point.y}`"
              :cx="point.x"
              :cy="point.y"
              r="3"
              :fill="serie.color"
            />
          </template>
          <template v-else>
            <rect
              v-for="bar in verticalBars(serie)"
              :key="`${serie.name}-${bar.index}`"
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              rx="4"
              :fill="serie.color"
            >
              <title>{{ categories[bar.index] }}: {{ formatValue(bar.value) }}</title>
            </rect>
          </template>
        </g>
        <g class="chart-label">
          <text v-for="label in xLabels" :key="label.text" :x="label.x" :y="plot.bottom + 24" text-anchor="middle">
            {{ label.text }}
          </text>
        </g>
        <g class="chart-legend" :transform="`translate(${plot.left} 18)`">
          <g v-for="(serie, index) in normalizedSeries" :key="serie.name || index" :transform="`translate(${index * 120} 0)`">
            <rect width="10" height="10" rx="2" :fill="serie.color" />
            <text x="18" y="10">{{ serie.name || chartKind }}</text>
          </g>
        </g>
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  option: { type: Object, required: true }
})

const palette = ['#2563eb', '#0891b2', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#7c3aed']
const plot = { left: 92, right: 596, top: 42, bottom: 276 }
plot.width = plot.right - plot.left
plot.height = plot.bottom - plot.top

const series = computed(() => props.option.series || [])
const chartKind = computed(() => series.value[0]?.type || 'bar')
const isHorizontalBar = computed(() => props.option.yAxis?.type === 'category' && chartKind.value === 'bar')
const categories = computed(() => props.option.xAxis?.data || props.option.yAxis?.data || [])
const normalizedSeries = computed(() =>
  series.value.map((item, index) => ({
    ...item,
    name: item.name || '',
    color: item.itemStyle?.color || palette[index % palette.length],
    data: (item.data || []).map((value) => Number(value?.value ?? value ?? 0))
  }))
)

const maxValue = computed(() => {
  const values = normalizedSeries.value.flatMap((item) => item.data)
  return Math.max(...values, 1)
})

const xLabels = computed(() => {
  const step = categories.value.length > 1 ? plot.width / (categories.value.length - 1) : plot.width
  return categories.value.map((text, index) => ({
    text,
    x: categories.value.length > 1 ? plot.left + index * step : plot.left + plot.width / 2
  }))
})

const horizontalBars = computed(() => {
  const data = normalizedSeries.value[0]?.data || []
  const row = plot.height / Math.max(data.length, 1)
  return data.map((value, index) => ({
    index,
    name: categories.value[index],
    value,
    color: normalizedSeries.value[0]?.color || palette[0],
    x: plot.left,
    y: plot.top + index * row + row * 0.18,
    height: Math.max(row * 0.52, 8),
    width: Math.max((value / maxValue.value) * (plot.width - 44), 2)
  }))
})

const isDonut = computed(() => Array.isArray(series.value[0]?.radius))
const innerRadius = computed(() => (isDonut.value ? 68 : 0))
const outerRadius = computed(() => (isDonut.value ? 112 : 104))
const legendX = computed(() => (isDonut.value ? 460 : 430))

const pieSlices = computed(() => {
  const data = series.value[0]?.data || []
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1
  let start = -90

  return data.map((item, index) => {
    const value = Number(item.value || 0)
    const angle = (value / total) * 360
    const end = start + angle
    const slice = {
      name: item.name,
      value,
      color: item.itemStyle?.color || palette[index % palette.length],
      path: arcPath(start, end, innerRadius.value, outerRadius.value)
    }
    start = end
    return slice
  })
})

function pointOnCircle(angle, radius) {
  const radians = (Math.PI / 180) * angle
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  }
}

function arcPath(start, end, inner, outer) {
  const large = end - start > 180 ? 1 : 0
  const a = pointOnCircle(start, outer)
  const b = pointOnCircle(end, outer)

  if (!inner) {
    return `M 0 0 L ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} Z`
  }

  const c = pointOnCircle(end, inner)
  const d = pointOnCircle(start, inner)
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y} Z`
}

function valueY(value) {
  return plot.bottom - (Number(value || 0) / maxValue.value) * plot.height
}

function lineDots(serie) {
  const step = serie.data.length > 1 ? plot.width / (serie.data.length - 1) : plot.width
  return serie.data.map((value, index) => ({
    x: serie.data.length > 1 ? plot.left + index * step : plot.left + plot.width / 2,
    y: valueY(value)
  }))
}

function linePoints(serie) {
  return lineDots(serie)
    .map((point) => `${point.x},${point.y}`)
    .join(' ')
}

function verticalBars(serie) {
  const barSeries = normalizedSeries.value.filter((item) => item.type === 'bar')
  const serieIndex = Math.max(barSeries.indexOf(serie), 0)
  const groupWidth = plot.width / Math.max(categories.value.length, 1)
  const width = Math.min(28, (groupWidth * 0.7) / Math.max(barSeries.length, 1))

  return serie.data.map((value, index) => {
    const height = plot.bottom - valueY(value)
    return {
      index,
      value,
      x: plot.left + index * groupWidth + (groupWidth - width * barSeries.length) / 2 + serieIndex * width,
      y: plot.bottom - height,
      width: Math.max(width - 3, 4),
      height
    }
  })
}

function formatValue(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}
</script>
