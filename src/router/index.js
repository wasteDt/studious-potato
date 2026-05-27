import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '总览' }
  },
  {
    path: '/buildings',
    name: 'buildings',
    component: () => import('@/views/BuildingList.vue'),
    meta: { title: '教学楼' }
  },
  {
    path: '/buildings/:id',
    name: 'building-detail',
    component: () => import('@/views/BuildingDetail.vue'),
    meta: { title: '教学楼详情' }
  },
  {
    path: '/electricity',
    name: 'electricity',
    component: () => import('@/views/Electricity.vue'),
    meta: { title: '用电分析' }
  },
  {
    path: '/water',
    name: 'water',
    component: () => import('@/views/Water.vue'),
    meta: { title: '用水分析' }
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: () => import('@/views/Analysis.vue'),
    meta: { title: '综合分析' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '平台'} - 校园水电能耗可视化平台`
})

export default router
