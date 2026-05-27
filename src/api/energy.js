import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 8000
})

const cache = new Map()
const CACHE_TTL = 1000 * 60 * 5

async function cachedGet(url, params = {}) {
  const key = `${url}:${JSON.stringify(params)}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  const { data } = await request.get(url, { params })
  cache.set(key, { data, time: Date.now() })
  return data
}

export function getBuildings() {
  return cachedGet('/buildings')
}

export function getBuilding(id) {
  return cachedGet(`/buildings/${id}`)
}

export function getDailyEnergy(params = {}) {
  return cachedGet('/dailyEnergy', params)
}

export function getMonthlyEnergy(params = {}) {
  return cachedGet('/monthlyEnergy', params)
}

export function getInspections() {
  return cachedGet('/inspections')
}

export async function createInspection(payload) {
  const { data } = await request.post('/inspections', payload)
  cache.delete('/inspections:{}')
  return data
}

export function clearEnergyCache() {
  cache.clear()
}
