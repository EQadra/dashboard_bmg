import { defineStore } from 'pinia'
import { getCsrfToken } from '../utils/csrf'
import { useAxios } from '../plugins/axios'

export const useCashRegisterStore = defineStore('cashRegister', {
  state: () => ({
    cashRegister: null,
    loading: false,
    error: null,
  }),

  getters: {
    isOpen: (state) =>
      !!state.cashRegister && !state.cashRegister.closing_cash_pen,
  },

  actions: {
    async fetchToday() {
      this.loading = true
      this.error = null
      try {
        const api = useAxios() // ✅ AQUÍ SÍ
        const res = await api.get('/api/caja/actual')
        this.cashRegister = res.data.data
      } catch (err) {
        this.cashRegister = null
        this.error =
          err.response?.data?.message || 'Error al cargar caja actual'
        console.error('❌ Error fetchToday:', err)
      } finally {
        this.loading = false
      }
    },

    async openCash({
      opening_cash_pen,
      opening_cash_bob = 0,
      opening_cash_usd = 0,
      opening_gold,
    }) {
      this.loading = true
      this.error = null
      try {
        const api = useAxios() // ✅ AQUÍ
        await getCsrfToken()

        const res = await api.post('/api/caja/abrir', {
          opening_cash_pen,
          opening_cash_bob,
          opening_cash_usd,
          opening_gold,
        })

        this.cashRegister = res.data.data
        return this.cashRegister
      } catch (err) {
        this.error =
          err.response?.data?.message || 'Error al abrir la caja'
        console.error('❌ Error openCash:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async closeCash({
      closing_cash_pen,
      closing_cash_bob = 0,
      closing_cash_usd = 0,
      closing_gold,
    }) {
      this.loading = true
      this.error = null
      try {
        const api = useAxios() // ✅ AQUÍ
        await getCsrfToken()

        const res = await api.post('/api/caja/cerrar', {
          closing_cash_pen,
          closing_cash_bob,
          closing_cash_usd,
          closing_gold,
        })

        this.cashRegister = res.data.data
        return this.cashRegister
      } catch (err) {
        this.error =
          err.response?.data?.message || 'Error al cerrar la caja'
        console.error('❌ Error closeCash:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
