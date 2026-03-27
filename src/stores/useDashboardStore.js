import { defineStore } from 'pinia'
import { useAxios } from '../plugins/axios'

const api = useAxios()

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    stats: [],
    charts: {},
    caja: {},
    error: null
  }),

  actions: {
async fetchDashboard() {
      this.loading = true
      try {
        const res = await api.get('/api/admin/dashboard')

        console.log('🔥 RESPUESTA REAL:', res.data)

        this.stats = res.data.data.stats
        this.charts = res.data.data.charts
        this.caja = res.data.data.caja

      } catch (e) {
        console.error(e)
        this.error = e.response?.data?.message
      } finally {
        this.loading = false
      }
    }
  }
})