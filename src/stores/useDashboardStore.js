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
        const { data } = await api.get('/api/admin/dashboard')

        this.stats = data.data?.stats || []
        this.charts = data.data?.charts || {}
        this.caja = data.data?.caja || {}

      } catch (e) {
        this.error = e.response?.data?.message
      } finally {
        this.loading = false
      }
    }
  }
})