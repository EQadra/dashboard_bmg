// src/stores/dashboard.js
import { defineStore } from 'pinia'
import { useAxios } from '../plugins/axios'
import { getCsrfToken } from '../utils/csrf'

const api = useAxios()

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    goldPrices: [],
    userStats: {},
    kpis: [],
    loading: false,
    error: null,
  }),

  actions: {
    /** 🔹 Cargar datos del dashboard */
    async fetchDashboardData() {
      this.loading = true
      this.error = null

      console.group('%c📊 DASHBOARD FETCH START', 'color: #16a34a; font-weight: bold;')
      try {
        // ✅ Asegura cookie CSRF si usas Sanctum
        await getCsrfToken()

        const { data } = await api.get('/api/admin/dashboard')

        // ✅ Asignaciones con fallback
        this.goldPrices = data.goldPrices || []
        this.userStats = data.userStats || {}
        this.kpis = data.kpis || []

        console.log('💰 Precios del oro:', this.goldPrices)
        console.log('👥 Estadísticas de usuarios:', this.userStats)
        console.log('📈 KPIs:', this.kpis)
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar el dashboard'
        console.error('❌ Error al obtener dashboard:', err.response?.data || err.message)
      } finally {
        this.loading = false
        console.groupEnd()
      }
    },

    /** 🔹 Cargar reportes administrativos */
    async fetchReportes() {
      console.group('%c📄 FETCH REPORTES', 'color: #2563eb; font-weight: bold;')
      try {
        await getCsrfToken() // opcional si backend requiere cookie activa

        const { data } = await api.get('/api/reportes')
        console.log('📥 Respuesta de /api/reportes:', data)
        console.groupEnd()
        return data
      } catch (err) {
        console.error('❌ Error al obtener reportes:', err.response?.data || err.message)
        console.groupEnd()
        throw new Error(err.response?.data?.message || 'Error al obtener reportes')
      }
    },
  },
})
