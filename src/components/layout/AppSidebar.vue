<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">能</div>
      <div>
        <strong>校园能耗</strong>
        <span>可视化平台</span>
      </div>
    </div>

    <nav class="nav-list">
      <RouterLink v-for="item in navItems" :key="item.path" :to="item.path">
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
const navItems = [
  { path: '/dashboard', label: '能耗总览', icon: '01' },
  { path: '/buildings', label: '教学楼管理', icon: '02' },
  { path: '/electricity', label: '用电分析', icon: '03' },
  { path: '/water', label: '用水分析', icon: '04' },
  { path: '/analysis', label: '综合分析', icon: '05' }
]
</script>
