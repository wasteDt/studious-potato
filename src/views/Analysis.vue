<template>
  <section class="page">
    <LoadingState v-if="loading" />
    <template v-else>
      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>综合能耗排名</h2>
            <span>电 + 水折算</span>
          </div>
          <BaseChart :option="scoreOption" />
        </section>
        <section class="panel">
          <div class="panel-title">
            <h2>状态分布</h2>
            <span>教学楼数量</span>
          </div>
          <BaseChart :option="statusOption" />
        </section>
      </div>

      <section class="panel">
        <div class="panel-title">
          <h2>巡检记录提交</h2>
          <span>POST /inspections</span>
        </div>
        <form class="inspection-form" @submit.prevent="submitInspection">
          <select v-model.number="form.buildingId" required>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
          <select v-model="form.type" required>
            <option value="用电巡检">用电巡检</option>
            <option value="用水巡检">用水巡检</option>
            <option value="综合巡检">综合巡检</option>
          </select>
          <input v-model.trim="form.content" required maxlength="60" placeholder="填写处理措施或巡检说明" />
          <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交记录' }}</button>
        </form>
      </section>

      <div class="content-grid two">
        <section class="panel">
          <div class="panel-title">
            <h2>分析结论</h2>
            <span>供后勤管理参考</span>
          </div>
          <div class="analysis-list">
            <article v-for="item in conclusions" :key="item.title">
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>最近巡检记录</h2>
            <span>GET /inspections</span>
          </div>
          <div class="inspection-list">
            <article v-for="item in inspections" :key="item.id">
              <strong>{{ item.buildingName }} · {{ item.type }}</strong>
              <p>{{ item.content }}</p>
              <span>{{ item.createdAt }}</span>
            </article>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import LoadingState from '@/components/LoadingState.vue'
import { createInspection, getBuildings, getDailyEnergy, getInspections } from '@/api/energy'
import { mergeBuildingEnergy } from '@/utils/energy'

const loading = ref(true)
const submitting = ref(false)
const buildings = ref([])
const daily = ref([])
const inspections = ref([])
const form = reactive({
  buildingId: 1,
  type: '用电巡检',
  content: ''
})

onMounted(async () => {
  const [buildingData, dailyData, inspectionData] = await Promise.all([
    getBuildings(),
    getDailyEnergy(),
    getInspections()
  ])
  buildings.value = buildingData
  daily.value = dailyData
  inspections.value = [...inspectionData].reverse()
  form.buildingId = buildingData[0]?.id || 1
  loading.value = false
})

const ranked = computed(() => mergeBuildingEnergy(buildings.value, daily.value).sort((a, b) => b.totalScore - a.totalScore))
const statusCounts = computed(() => {
  return buildings.value.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})
})

const scoreOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 90, right: 24, bottom: 30, top: 20 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: ranked.value.map((item) => item.name).reverse() },
  series: [{ type: 'bar', data: ranked.value.map((item) => item.totalScore).reverse(), itemStyle: { color: '#475569' } }]
}))

const statusOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: '68%',
      data: [
        { name: '正常', value: statusCounts.value.normal || 0 },
        { name: '偏高', value: statusCounts.value.warning || 0 },
        { name: '异常', value: statusCounts.value.high || 0 }
      ]
    }
  ]
}))

const conclusions = computed(() => {
  const top = ranked.value[0]
  const second = ranked.value[1]
  const normalCount = statusCounts.value.normal || 0
  return [
    {
      title: '重点管控对象',
      text: `${top?.name || '实验实训楼'} 综合能耗排名第一，应优先纳入本周巡检计划。`
    },
    {
      title: '趋势判断',
      text: `${second?.name || '第二教学楼'} 能耗接近最高值，建议观察后续 3 天变化并与课程安排进行比对。`
    },
    {
      title: '整体状态',
      text: `当前共有 ${normalCount} 栋教学楼处于正常状态，异常和偏高对象需要结合楼宇面积、设备类型进一步分析。`
    }
  ]
})

async function submitInspection() {
  const building = buildings.value.find((item) => item.id === form.buildingId)
  if (!building || !form.content) return

  submitting.value = true
  try {
    const created = await createInspection({
      buildingId: building.id,
      buildingName: building.name,
      type: form.type,
      content: form.content,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    })
    inspections.value = [created, ...inspections.value]
    form.content = ''
  } finally {
    submitting.value = false
  }
}
</script>
