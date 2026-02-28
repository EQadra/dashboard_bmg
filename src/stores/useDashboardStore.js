// src/stores/dashboard.js
import { defineStore } from 'pinia'
import { useAxios } from '../plugins/axios'
import { getCsrfToken } from '../utils/csrf'

const api = useAxios()

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    kpis: [],
    goldPrices: {
      labels: [],
      data: [],
    },
    userDistribution: {
      labels: [],
      data: [],
    },
    loading: false,
    error: null,
  }),

  actions: {
    /** 📊 Cargar KPIs */
    async fetchStats() {
      this.loading = true
      try {
        await getCsrfToken()
        const { data } = await api.get('/api/admin/dashboard/stats')
        this.kpis = data.data || []
      } catch (err) {
        this.error = err.response?.data?.message || 'Error KPIs'
      } finally {
        this.loading = false
      }
    },

    /** 📈 Cargar gráficos */
    async fetchCharts() {
      this.loading = true
      try {
        await getCsrfToken()
        const { data } = await api.get('/api/admin/dashboard/charts')

        this.goldPrices = data.data?.goldPrices ?? { labels: [], data: [] }
        this.userDistribution = data.data?.userDistribution ?? { labels: [], data: [] }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error gráficos'
      } finally {
        this.loading = false
      }
    },

    /** 🚀 Cargar TODO el dashboard */
    async fetchDashboardData() {
      this.error = null
      await Promise.all([
        this.fetchStats(),
        this.fetchCharts(),
      ])
    },
  },
})
