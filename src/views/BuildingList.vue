<template>
  <section class="page">
    <div class="toolbar">
      <input v-model.trim="keyword" type="search" placeholder="搜索教学楼名称或编号" />
      <select v-model="sortKey">
        <option value="totalScore">按综合能耗排序</option>
        <option value="electricity">按用电量排序</option>
        <option value="water">按用水量排序</option>
        <option value="area">按建筑面积排序</option>
      </select>
    </div>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="filteredBuildings.length === 0" />
    <div v-else class="building-grid">
      <RouterLink v-for="building in filteredBuildings" :key="building.id" class="building-card" :to="`/buildings/${building.id}`">
        <div class="card-head">
          <div>
            <span class="building-code">{{ building.code }}</span>
            <h2>{{ building.name }}</h2>
          </div>
          <span :class="['status-pill', statusMeta(building.status).className]">{{ statusMeta(building.status).text }}</span>
        </div>
        <div class="metric-row">
          <span>楼层</span>
          <strong>{{ building.floors }} 层</strong>
        </div>
        <div class="metric-row">
          <span>教室</span>
          <strong>{{ building.rooms }} 间</strong>
        </div>
        <div class="metric-row">
          <span>今日用电</span>
          <strong>{{ formatNumber(building.electricity) }} kWh</strong>
        </div>
        <div class="metric-row">
          <span>今日用水</span>
          <strong>{{ formatNumber(building.water) }} m³</strong>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import { getBuildings, getDailyEnergy } from '@/api/energy'
import { formatNumber, mergeBuildingEnergy, statusMeta } from '@/utils/energy'

const loading = ref(true)
const keyword = ref('')
const sortKey = ref('totalScore')
const buildings = ref([])
const daily = ref([])

onMounted(async () => {
  const [buildingData, dailyData] = await Promise.all([getBuildings(), getDailyEnergy()])
  buildings.value = buildingData
  daily.value = dailyData
  loading.value = false
})

const enrichedBuildings = computed(() => mergeBuildingEnergy(buildings.value, daily.value))
const filteredBuildings = computed(() => {
  const query = keyword.value.toLowerCase()
  return enrichedBuildings.value
    .filter((item) => item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query))
    .sort((a, b) => b[sortKey.value] - a[sortKey.value])
})
</script>
