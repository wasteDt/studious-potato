import axios from 'axios'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const useSupabase = Boolean(supabaseUrl && supabaseAnonKey)

const request = axios.create({
  baseURL: useSupabase ? `${supabaseUrl}/rest/v1` : import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 8000,
  headers: useSupabase
    ? {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      }
    : {}
})

const cache = new Map()
const CACHE_TTL = 1000 * 60 * 5

function toCamelEnergy(item) {
  if (!item) return item
  return {
    ...item,
    buildingId: item.building_id ?? item.buildingId
  }
}

function toCamelInspection(item) {
  if (!item) return item
  return {
    ...item,
    buildingId: item.building_id ?? item.buildingId,
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

  const { data } = await request.get(url, { params })
  const mapped = mapper(data)
  cache.set(key, { data: mapped, time: Date.now() })
  return mapped
}

export function getBuildings() {
  if (useSupabase) {
    return cachedGet('/buildings', { select: '*', order: 'id.asc' })
  }
  return cachedGet('/buildings')
}

export async function getBuilding(id) {
  if (useSupabase) {
    const rows = await cachedGet('/buildings', { select: '*', id: `eq.${id}`, limit: 1 })
    return rows[0]
  }
  return cachedGet(`/buildings/${id}`)
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

  return cachedGet('/dailyEnergy', params)
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

  return cachedGet('/monthlyEnergy', params)
}

export function getInspections() {
  if (useSupabase) {
    return cachedGet('/inspections', { select: '*', order: 'id.asc' }, (data) => data.map(toCamelInspection))
  }

  return cachedGet('/inspections')
}

export async function createInspection(payload) {
  if (useSupabase) {
    const { data } = await request.post('/inspections', toSupabaseInspection(payload), {
      headers: { Prefer: 'return=representation' }
    })
    cache.clear()
    return toCamelInspection(data[0])
  }

  const { data } = await request.post('/inspections', payload)
  cache.delete('/inspections:{}')
  return data
}

export function clearEnergyCache() {
  cache.clear()
}
