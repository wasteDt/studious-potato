<template>
  <section class="page">
    <LoadingState v-if="loading" />
    <template v-else>
      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>今日用水对比</h2>
            <span>m³</span>
          </div>
          <BaseChart :option="barOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>本月用水占比</h2>
            <span>按教学楼</span>
          </div>
          <BaseChart :option="pieOption" />
        </section>
      </div>

      <section class="panel">
        <div class="panel-title">
          <h2>用水巡检建议</h2>
          <span>自动生成</span>
        </div>
        <div class="notice-list">
          <p v-for="item in suggestions" :key="item">{{ item }}</p>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import LoadingState from '@/components/LoadingState.vue'
import { getBuildings, getDailyEnergy, getMonthlyEnergy } from '@/api/energy'
import { mergeBuildingEnergy } from '@/utils/energy'

const loading = ref(true)
const buildings = ref([])
const daily = ref([])
const monthly = ref([])

onMounted(async () => {
  const [buildingData, dailyData, monthlyData] = await Promise.all([getBuildings(), getDailyEnergy(), getMonthlyEnergy()])
  buildings.value = buildingData
  daily.value = dailyData
  monthly.value = monthlyData
  loading.value = false
})

const todayBuildings = computed(() => mergeBuildingEnergy(buildings.value, daily.value).sort((a, b) => b.water - a.water))
const monthRecords = computed(() => monthly.value.filter((item) => item.month === '2026-05'))

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 45, right: 20, bottom: 42, top: 20 },
  xAxis: { type: 'category', data: todayBuildings.value.map((item) => item.name), axisLabel: { rotate: 24 } },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: todayBuildings.value.map((item) => item.water), itemStyle: { color: '#0891b2' } }]
}))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 24 },
  series: [
    {
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['38%', '52%'],
      data: buildings.value.map((building) => ({
        name: building.name,
        value: monthRecords.value.find((item) => item.buildingId === building.id)?.water || 0
      }))
    }
  ]
}))

const suggestions = computed(() => {
  const top = todayBuildings.value[0]
  return [
    `${top?.name || '重点教学楼'} 今日用水量最高，建议检查卫生间、实验室和清洁用水情况。`,
    '连续多日夜间用水不降时，应优先排查管道渗漏。',
    '可按教学楼设置月度用水基准，超过 10% 时触发后勤巡检。'
  ]
})
</script>
