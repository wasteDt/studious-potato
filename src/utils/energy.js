export function sumBy(list, key) {
  return list.reduce((total, item) => total + Number(item[key] || 0), 0)
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

export function statusMeta(status) {
  const map = {
    normal: { text: '正常', className: 'status-normal' },
    warning: { text: '偏高', className: 'status-warning' },
    high: { text: '异常', className: 'status-high' }
  }

  return map[status] || map.normal
}

export function mergeBuildingEnergy(buildings, records, mode = 'daily') {
  return buildings.map((building) => {
    const matched = records.filter((item) => item.buildingId === building.id)
    const latest = mode === 'daily' ? matched.at(-1) : matched.find((item) => item.month === '2026-05') || matched.at(-1)
    const electricity = latest?.electricity || 0
    const water = latest?.water || 0

    return {
      ...building,
      electricity,
      water,
      totalScore: electricity + water * 8
    }
  })
}
