<template>
  <section class="page">
    <LoadingState v-if="loading" />
    <template v-else>
      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>今日用电排名</h2>
            <span>kWh</span>
          </div>
          <BaseChart :option="rankOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>月度用电趋势</h2>
            <span>全校汇总</span>
          </div>
          <BaseChart :option="monthOption" />
        </section>
      </div>

      <section class="panel">
        <div class="panel-title">
          <h2>用电异常关注</h2>
          <span>超过 1700 kWh</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>教学楼</th>
              <th>今日用电量</th>
              <th>状态</th>
              <th>处理建议</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in warnings" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ formatNumber(item.electricity) }} kWh</td>
              <td><span :class="['status-pill', statusMeta(item.status).className]">{{ statusMeta(item.status).text }}</span></td>
              <td>检查空调、照明和大功率设备使用情况</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import LoadingState from '@/components/LoadingState.vue'
import { getBuildings, getDailyEnergy, getMonthlyEnergy } from '@/api/energy'
import { formatNumber, mergeBuildingEnergy, statusMeta, sumBy } from '@/utils/energy'

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

const todayBuildings = computed(() => mergeBuildingEnergy(buildings.value, daily.value).sort((a, b) => b.electricity - a.electricity))
const warnings = computed(() => todayBuildings.value.filter((item) => item.electricity > 1700))

const rankOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 90, right: 24, bottom: 30, top: 20 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: todayBuildings.value.map((item) => item.name).reverse() },
  series: [{ type: 'bar', data: todayBuildings.value.map((item) => item.electricity).reverse(), itemStyle: { color: '#2563eb' } }]
}))

const monthOption = computed(() => {
  const months = [...new Set(monthly.value.map((item) => item.month))]
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 54, right: 24, bottom: 30, top: 20 },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, data: months.map((month) => sumBy(monthly.value.filter((item) => item.month === month), 'electricity')) }]
  }
})
</script>
