const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const useSupabase = Boolean(supabaseUrl && supabaseAnonKey)
const baseURL = useSupabase ? `${supabaseUrl}/rest/v1` : import.meta.env.VITE_API_BASE_URL || '/api'
const baseHeaders = useSupabase
  ? {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    }
  : {}

const cache = new Map()
const CACHE_TTL = 1000 * 60 * 5

function toNumber(value) {
  return Number(value || 0)
}

function toCamelBuilding(item) {
  if (!item) return item
  return {
    ...item,
    id: toNumber(item.id),
    floors: toNumber(item.floors),
    rooms: toNumber(item.rooms),
    area: toNumber(item.area)
  }
}

function toCamelEnergy(item) {
  if (!item) return item
  return {
    ...item,
    id: toNumber(item.id),
    buildingId: toNumber(item.building_id ?? item.buildingId),
    electricity: toNumber(item.electricity),
    water: toNumber(item.water)
  }
}

function toCamelInspection(item) {
  if (!item) return item
  return {
    ...item,
    id: item.id,
    buildingId: toNumber(item.building_id ?? item.buildingId),
    buildingName: item.building_name ?? item.buildingName,
    createdAt: item.created_at ?? item.createdAt
  }
}

function toSupabaseInspection(payload) {
  return {
    building_id: payload.buildingId,
    building_name: payload.buildingName,
    type: payload.type,
    content: payload.content,
    created_at: payload.createdAt
  }
}

async function cachedGet(url, params = {}, mapper = (data) => data) {
  const key = `${url}:${JSON.stringify(params)}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  const data = await requestJson(url, { params })
  const mapped = mapper(data)
  cache.set(key, { data: mapped, time: Date.now() })
  return mapped
}

async function requestJson(url, options = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8000)
  const query = options.params ? `?${new URLSearchParams(options.params)}` : ''

  try {
    const response = await fetch(`${baseURL}${url}${query}`, {
      method: options.method || 'GET',
      headers: {
        ...baseHeaders,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    return response.json()
  } finally {
    window.clearTimeout(timeout)
  }
}

export function getBuildings() {
  if (useSupabase) {
    return cachedGet('/buildings', { select: '*', order: 'id.asc' }, (data) => data.map(toCamelBuilding))
  }
  return cachedGet('/buildings', {}, (data) => data.map(toCamelBuilding))
}

export async function getBuilding(id) {
  if (useSupabase) {
    const rows = await cachedGet('/buildings', { select: '*', id: `eq.${id}`, limit: 1 }, (data) => data.map(toCamelBuilding))
    return rows[0]
  }
  return cachedGet(`/buildings/${id}`, {}, toCamelBuilding)
}

export function getDailyEnergy(params = {}) {
  if (useSupabase) {
    const query = {
      select: '*',
      order: 'id.asc'
    }

    if (params.buildingId) {
      query.building_id = `eq.${params.buildingId}`
    }

    return cachedGet('/daily_energy', query, (data) => data.map(toCamelEnergy))
  }

  return cachedGet('/dailyEnergy', params, (data) => data.map(toCamelEnergy))
}

export function getMonthlyEnergy(params = {}) {
  if (useSupabase) {
    const query = {
      select: '*',
      order: 'id.asc'
    }

    if (params.buildingId) {
      query.building_id = `eq.${params.buildingId}`
    }

    return cachedGet('/monthly_energy', query, (data) => data.map(toCamelEnergy))
  }

  return cachedGet('/monthlyEnergy', params, (data) => data.map(toCamelEnergy))
}

export function getInspections() {
  if (useSupabase) {
    return cachedGet('/inspections', { select: '*', order: 'id.asc' }, (data) => data.map(toCamelInspection))
  }

  return cachedGet('/inspections', {}, (data) => data.map(toCamelInspection))
}

export async function createInspection(payload) {
  if (useSupabase) {
    const data = await requestJson('/inspections', {
      method: 'POST',
      body: toSupabaseInspection(payload),
      headers: { Prefer: 'return=representation' }
    })
    cache.clear()
    return toCamelInspection(data[0])
  }

  const data = await requestJson('/inspections', {
    method: 'POST',
    body: payload
  })
  cache.delete('/inspections:{}')
  return data
}

export function clearEnergyCache() {
  cache.clear()
}
