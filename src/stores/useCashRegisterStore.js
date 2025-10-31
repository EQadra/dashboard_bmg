// FILE: src/stores/useCashRegisterStore.js
import { defineStore } from 'pinia'
import { getCsrfToken } from '../utils/csrf'
import { useAxios, setupAxios } from '../plugins/axios'

let api
try {
  api = useAxios()
} catch {
  console.warn('⚠️ Axios no inicializado. Configurando automáticamente...')
  api = setupAxios()
}

export const useCashRegisterStore = defineStore('cashRegister', {
  state: () => ({
    cashRegister: null,
    loading: false,
    error: null,
  }),

  getters: {
    /** ✅ Saber si hay caja abierta hoy */
    isOpen: (state) =>
      !!state.cashRegister && !state.cashRegister.closing_cash_pen,
  },

  actions: {
    /** 🔹 Obtener la caja del día actual */
    async fetchToday() {
      this.loading = true
      this.error = null
      try {
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

    /**
     * 🔹 Abrir una nueva caja
     * @param {Object} data
     * @param {number} data.opening_cash_pen
     * @param {number} [data.opening_cash_bob]
     * @param {number} [data.opening_cash_usd]
     * @param {number} data.opening_gold
     */
    async openCash({
      opening_cash_pen,
      opening_cash_bob = 0,
      opening_cash_usd = 0,
      opening_gold,
    }) {
      this.loading = true
      this.error = null
      try {
        await getCsrfToken() // ✅ se usa la utilidad global
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

    /**
     * 🔹 Cerrar la caja actual
     * @param {Object} data
     * @param {number} data.closing_cash_pen
     * @param {number} [data.closing_cash_bob]
     * @param {number} [data.closing_cash_usd]
     * @param {number} data.closing_gold
     */
    async closeCash({
      closing_cash_pen,
      closing_cash_bob = 0,
      closing_cash_usd = 0,
      closing_gold,
    }) {
      this.loading = true
      this.error = null
      try {
        await getCsrfToken() // ✅ unificado
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
