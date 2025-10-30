import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './useAuthStore'

export const useTransactionsStore = defineStore('transactions', () => {
  // --- Estados globales ---
  const loading = ref(false)
  const error = ref(null)
  const success = ref(null)
  const today = ref([])

  // --- Inputs del formulario / cálculo ---
  const inputs = ref({
    clientName: '',
    tipoVenta: '0', // 0 = regular, 1 = empresa
    pricePerOz: '',
    exchangeRate: '',
    purity: '',
    discountPercentage: '',
    grams: ''
  })

  const moneda = ref('PEN') // puede ser 'PEN', 'USD', o 'BOB'
  const tipoCambioBOB = ref(0.48) // ejemplo, puedes hacerlo dinámico si usas API

  // --- Cálculos automáticos ---
  const computedResults = computed(() => {
    const oz = parseFloat(inputs.value.pricePerOz)
    const tc = parseFloat(inputs.value.exchangeRate)
    const ley = parseFloat(inputs.value.purity)
    const desc = parseFloat(inputs.value.discountPercentage) || 0
    const gramos = parseFloat(inputs.value.grams)
    const valido = oz && tc && ley && gramos

    if (!valido) return { valido: false }

    const pricePerGramUSD = (oz / 31.1035) * ley
    const pricePerGramPEN = pricePerGramUSD * tc * (1 - desc / 100)
    const totalPEN = pricePerGramPEN * gramos
    const totalUSD = totalPEN / tc
    const totalBOB = totalUSD / tipoCambioBOB.value

    return {
      valido: true,
      pricePerGramUSD,
      pricePerGramPEN,
      totalPEN,
      totalUSD,
      totalBOB
    }
  })

  // --- Limpiar todo ---
  const clearAll = () => {
    inputs.value = {
      clientName: '',
      tipoVenta: '0',
      pricePerOz: '',
      exchangeRate: '',
      purity: '',
      discountPercentage: '',
      grams: ''
    }
    moneda.value = 'PEN'
    success.value = null
    error.value = null
  }

  // --- Actualizar inputs dinámicamente ---
  const setValue = (key, val) => {
    inputs.value[key] = val
  }

  // --- Guardar nueva transacción ---
  const saveGoldCalculation = async () => {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null
    success.value = null

    try {
      await authStore.getCsrfToken()

      const payload = {
        grams: inputs.value.grams,
        purity: inputs.value.purity,
        discount_percentage: inputs.value.discountPercentage || 0,
        price_per_gram_pen: computedResults.value.pricePerGramPEN,
        price_per_gram_usd: computedResults.value.pricePerGramUSD,
        price_per_gram_bob: computedResults.value.totalBOB ?? null,
        price_per_oz: inputs.value.pricePerOz,
        total_pen: computedResults.value.totalPEN,
        total_usd: computedResults.value.totalUSD,
        total_bob: computedResults.value.totalBOB,
        exchange_rate: inputs.value.exchangeRate,
        moneda: moneda.value,
        tipo_venta: inputs.value.tipoVenta,
        client_name: inputs.value.clientName,
        hora: new Date().toLocaleTimeString()
      }

      const { data } = await axios.post('/api/transactions', payload)
      success.value = data.message || '✅ Transacción registrada correctamente'
      await fetchToday() // refresca lista del día automáticamente
      clearAll()
    } catch (e) {
      console.error('Error al guardar transacción:', e)
      error.value = e.response?.data?.message || '❌ Error al guardar transacción'
    } finally {
      loading.value = false
    }
  }

  // --- Listar transacciones del día ---
  const fetchToday = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get('/api/transactions/day')
      today.value = (res.data.data ?? []).map(t => ({
        id: t.id,
        client_name: t.client_name || 'Sin nombre',
        moneda: t.moneda || '-',
        grams: t.grams ?? 0,
        total_pen: t.total_pen ?? 0,
        total_usd: t.total_usd ?? 0,
        total_bob: t.total_bob ?? 0,
        created_at: t.created_at || '-'
      }))
      console.log('Transacciones del día:', today.value)
    } catch (e) {
      console.error('Error al obtener transacciones:', e)
      error.value = 'No se pudo cargar las transacciones del día'
      today.value = []
    } finally {
      loading.value = false
    }
  }

  // --- Actualizar transacción ---
  const update = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      await axios.put(`/api/transactions/${id}`, payload)
      await fetchToday()
      success.value = '✅ Transacción actualizada correctamente'
    } catch (e) {
      console.error('Error al actualizar transacción:', e)
      error.value = '❌ Error al actualizar la transacción'
    } finally {
      loading.value = false
    }
  }

  // --- Eliminar transacción ---
  const remove = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta transacción?')) return
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/transactions/${id}`)
      today.value = today.value.filter(t => t.id !== id)
      success.value = '🗑️ Transacción eliminada correctamente'
    } catch (e) {
      console.error('Error al eliminar transacción:', e)
      error.value = '❌ Error al eliminar transacción'
    } finally {
      loading.value = false
    }
  }

  // --- Totales del día ---
  const totals = computed(() => {
    const totalPEN = today.value.reduce((sum, t) => sum + (t.total_pen || 0), 0)
    const totalUSD = today.value.reduce((sum, t) => sum + (t.total_usd || 0), 0)
    const totalBOB = today.value.reduce((sum, t) => sum + (t.total_bob || 0), 0)
    const totalGrams = today.value.reduce((sum, t) => sum + (t.grams || 0), 0)
    return { totalPEN, totalUSD, totalBOB, totalGrams }
  })

  // --- Exportación ---
  return {
    loading,
    error,
    success,
    today,
    inputs,
    moneda,
    tipoCambioBOB,
    computedResults,
    totals, // ✅ agregado para reportes/cierres
    saveGoldCalculation,
    fetchToday,
    update,
    remove,
    clearAll,
    setValue
  }
})
