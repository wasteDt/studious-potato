<template>
  <section class="page">
    <LoadingState v-if="loading" />
    <template v-else>
      <div class="stats-grid">
        <StatCard label="今日总用电量" :value="`${formatNumber(todayElectricity)} kWh`" trend="较昨日 +5.8%" tone="warning" />
        <StatCard label="今日总用水量" :value="`${formatNumber(todayWater)} m³`" trend="较昨日 +4.2%" tone="warning" />
        <StatCard label="本月总用电量" :value="`${formatNumber(monthElectricity)} kWh`" trend="环比 +6.1%" tone="danger" />
        <StatCard label="本月总用水量" :value="`${formatNumber(monthWater)} m³`" trend="环比 +5.4%" tone="danger" />
      </div>

      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>近 7 天水电趋势</h2>
            <span>全校汇总</span>
          </div>
          <BaseChart :option="trendOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>今日教学楼能耗对比</h2>
            <span>kWh / m³</span>
          </div>
          <BaseChart :option="buildingBarOption" />
        </section>
      </div>

      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>本月用电占比</h2>
            <span>按教学楼</span>
          </div>
          <BaseChart :option="pieOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>管理提示</h2>
            <span>自动分析</span>
          </div>
          <div class="notice-list">
            <p><strong>{{ topBuilding.name }}</strong> 今日综合能耗最高，建议优先检查空调、照明和实验设备使用情况。</p>
            <p><strong>{{ bestBuilding.name }}</strong> 单位面积能耗最低，可作为节能管理参考对象。</p>
            <p>本月用电量较 4 月整体上升，建议加强晚间巡检和高峰时段用电调度。</p>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import LoadingState from '@/components/LoadingState.vue'
import StatCard from '@/components/StatCard.vue'
import { getBuildings, getDailyEnergy, getMonthlyEnergy } from '@/api/energy'
import { formatNumber, mergeBuildingEnergy, sumBy } from '@/utils/energy'

const loading = ref(true)
const buildings = ref([])
const daily = ref([])
const monthly = ref([])

onMounted(async () => {
  const [buildingData, dailyData, monthlyData] = await Promise.all([
    getBuildings(),
    getDailyEnergy(),
    getMonthlyEnergy()
  ])
  buildings.value = buildingData
  daily.value = dailyData
  monthly.value = monthlyData
  loading.value = false
})

const todayRecords = computed(() => daily.value.filter((item) => item.date === '2026-05-27'))
const monthRecords = computed(() => monthly.value.filter((item) => item.month === '2026-05'))
const todayElectricity = computed(() => sumBy(todayRecords.value, 'electricity'))
const todayWater = computed(() => sumBy(todayRecords.value, 'water'))
const monthElectricity = computed(() => sumBy(monthRecords.value, 'electricity'))
const monthWater = computed(() => sumBy(monthRecords.value, 'water'))
const buildingDaily = computed(() => mergeBuildingEnergy(buildings.value, daily.value))
const topBuilding = computed(() => [...buildingDaily.value].sort((a, b) => b.totalScore - a.totalScore)[0] || {})
const bestBuilding = computed(() => [...buildingDaily.value].sort((a, b) => a.totalScore / a.area - b.totalScore / b.area)[0] || {})

const trendOption = computed(() => {
  const dates = [...new Set(daily.value.map((item) => item.date))]
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 45, right: 24, bottom: 30, top: 42 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: '用电量 kWh',
        type: 'line',
        smooth: true,
        data: dates.map((date) => sumBy(daily.value.filter((item) => item.date === date), 'electricity')),
        areaStyle: { opacity: 0.12 }
      },
      {
        name: '用水量 m³',
        type: 'line',
        smooth: true,
        data: dates.map((date) => sumBy(daily.value.filter((item) => item.date === date), 'water'))
      }
    ]
  }
})

const buildingBarOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0 },
  grid: { left: 45, right: 20, bottom: 42, top: 42 },
  xAxis: { type: 'category', data: buildingDaily.value.map((item) => item.name), axisLabel: { rotate: 24 } },
  yAxis: { type: 'value' },
  series: [
    { name: '用电量 kWh', type: 'bar', data: buildingDaily.value.map((item) => item.electricity), itemStyle: { color: '#2563eb' } },
    { name: '用水量 m³', type: 'bar', data: buildingDaily.value.map((item) => item.water), itemStyle: { color: '#0891b2' } }
  ]
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
        value: monthRecords.value.find((item) => Number(item.buildingId) === Number(building.id))?.electricity || 0
      }))
    }
  ]
}))
</script>
