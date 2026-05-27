<template>
  <section class="page">
    <LoadingState v-if="loading" />
    <template v-else>
      <div class="detail-hero">
        <div>
          <p class="eyebrow">{{ building.code }}</p>
          <h2>{{ building.name }}</h2>
          <span :class="['status-pill', statusMeta(building.status).className]">{{ statusMeta(building.status).text }}</span>
        </div>
        <RouterLink class="text-link" to="/buildings">返回教学楼列表</RouterLink>
      </div>

      <div class="stats-grid">
        <StatCard label="今日用电量" :value="`${formatNumber(today?.electricity)} kWh`" trend="实时采集模拟" />
        <StatCard label="今日用水量" :value="`${formatNumber(today?.water)} m³`" trend="实时采集模拟" />
        <StatCard label="建筑面积" :value="`${formatNumber(building.area)} m²`" trend="基础档案" />
        <StatCard label="单位面积能耗" :value="`${density.toFixed(2)}`" trend="综合评分" :tone="density > 0.17 ? 'danger' : 'success'" />
      </div>

      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>近 7 天趋势</h2>
            <span>{{ building.name }}</span>
          </div>
          <BaseChart :option="dailyOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>近 6 个月趋势</h2>
            <span>{{ building.name }}</span>
          </div>
          <BaseChart :option="monthlyOption" />
        </section>
      </div>

      <section class="panel">
        <div class="panel-title">
          <h2>节能建议</h2>
          <span>按状态生成</span>
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
import { useRoute } from 'vue-router'
import BaseChart from '@/components/charts/BaseChart.vue'
import LoadingState from '@/components/LoadingState.vue'
import StatCard from '@/components/StatCard.vue'
import { getBuilding, getDailyEnergy, getMonthlyEnergy } from '@/api/energy'
import { formatNumber, statusMeta } from '@/utils/energy'

const route = useRoute()
const loading = ref(true)
const building = ref({})
const daily = ref([])
const monthly = ref([])

onMounted(async () => {
  const id = Number(route.params.id)
  const [buildingData, dailyData, monthlyData] = await Promise.all([
    getBuilding(id),
    getDailyEnergy({ buildingId: id }),
    getMonthlyEnergy({ buildingId: id })
  ])
  building.value = buildingData
  daily.value = dailyData
  monthly.value = monthlyData
  loading.value = false
})

const today = computed(() => daily.value.find((item) => item.date === '2026-05-27') || daily.value.at(-1))
const density = computed(() => ((today.value?.electricity || 0) + (today.value?.water || 0) * 8) / (building.value.area || 1))

const dailyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0 },
  grid: { left: 45, right: 24, bottom: 30, top: 42 },
  xAxis: { type: 'category', data: daily.value.map((item) => String(item.date || '').slice(5)) },
  yAxis: { type: 'value' },
  series: [
    { name: '用电量 kWh', type: 'line', smooth: true, data: daily.value.map((item) => item.electricity) },
    { name: '用水量 m³', type: 'line', smooth: true, data: daily.value.map((item) => item.water) }
  ]
}))

const monthlyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0 },
  grid: { left: 48, right: 24, bottom: 30, top: 42 },
  xAxis: { type: 'category', data: monthly.value.map((item) => item.month) },
  yAxis: { type: 'value' },
  series: [
    { name: '月用电量 kWh', type: 'bar', data: monthly.value.map((item) => item.electricity), itemStyle: { color: '#2563eb' } },
    { name: '月用水量 m³', type: 'bar', data: monthly.value.map((item) => item.water), itemStyle: { color: '#0891b2' } }
  ]
}))

const suggestions = computed(() => {
  if (building.value.status === 'high') {
    return ['当前能耗状态异常，建议安排现场巡检。', '重点检查实验设备、空调系统和夜间照明是否存在持续运行。', '建议设置分时段用电阈值，超过阈值后自动预警。']
  }
  if (building.value.status === 'warning') {
    return ['当前能耗偏高，建议对比同类教学楼排查差异。', '晚自习结束后加强楼层照明关闭检查。', '用水数据持续上涨时应排查卫生间和管道漏水。']
  }
  return ['当前能耗处于正常范围。', '建议保持现有巡检频率，并继续关注高峰时段变化。', '可将该楼节能管理经验用于其他教学楼。']
})
</script>
