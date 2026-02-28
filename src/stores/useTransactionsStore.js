// 📁 src/stores/useTransactionsStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAxios } from '../plugins/axios'
import { getCsrfToken } from '../utils/csrf'

export const useTransactionsStore = defineStore('transactions', () => {
  // --- Estados ---
  const loading = ref(false)
  const error = ref(null)
  const success = ref(null)
  const today = ref([])

  // --- Inputs del formulario ---
  const inputs = ref({
    clientName: '',
    tipoVenta: '0',
    pricePerOz: '',
    exchangeRate: '',
    purity: '',
    discountPercentage: '',
    grams: ''
  })

  const moneda = ref('PEN')

  // --- Cálculos automáticos ---
  const computedResults = computed(() => {
    const oz = parseFloat(inputs.value.pricePerOz)
    const tc = parseFloat(inputs.value.exchangeRate)
    const ley = parseFloat(inputs.value.purity)
    const desc = parseFloat(inputs.value.discountPercentage) || 0
    const gramos = parseFloat(inputs.value.grams)

    const valido = oz > 0 && tc > 0 && ley > 0 && gramos > 0
    if (!valido) return { valido: false }

    let pricePerGramUSD = 0
    if (inputs.value.tipoVenta === '1') {
      pricePerGramUSD = (oz * ley) / 31.1035
    } else {
      pricePerGramUSD = oz / 31.1035
    }

    pricePerGramUSD *= (1 - desc / 100)

    const pricePerGramPEN = pricePerGramUSD * tc
    const totalPEN = pricePerGramPEN * gramos
    const totalUSD = totalPEN / tc
    const totalBOB = totalPEN

    return {
      valido: true,
      pricePerGramUSD,
      pricePerGramPEN,
      totalPEN,
      totalUSD,
      totalBOB
    }
  })

  // --- Valores para mostrar ---
  const precioGramo = computed(() => computedResults.value.pricePerGramPEN || 0)
  const totalMoneda = computed(() => computedResults.value.totalPEN || 0)

  // --- Utilidades ---
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

  const setValue = (key, val) => {
    inputs.value[key] = val
  }

  // --- GUARDAR TRANSACCIÓN ---
  const saveGoldCalculation = async () => {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const api = useAxios() // ✅ AQUÍ (CORRECTO)

      await getCsrfToken()

      const payload = {
        grams: inputs.value.grams,
        purity: inputs.value.purity,
        discount_percentage: inputs.value.discountPercentage || 0,
        price_per_gram_pen: computedResults.value.pricePerGramPEN,
        price_per_gram_usd: computedResults.value.pricePerGramUSD,
        price_per_gram_bob: computedResults.value.pricePerGramPEN,
        price_per_oz: inputs.value.pricePerOz,
        total_pen: computedResults.value.totalPEN,
        total_usd: computedResults.value.totalUSD,
        total_bob: computedResults.value.totalBOB,
        exchange_rate_pen_usd: inputs.value.exchangeRate,
        moneda: moneda.value,
        tipo_venta: inputs.value.tipoVenta === '1' ? 'empresa' : 'regular',
        client_name: inputs.value.clientName,
        hora: new Date().toLocaleTimeString('es-PE', { hour12: false })
      }

      const { data } = await api.post('/api/transactions', payload)

      success.value = data.message || 'Transacción guardada'
      await fetchToday()
      clearAll()
    } catch (e) {
      console.error('❌ Error al guardar:', e)
      error.value = e.response?.data?.message || 'Error al guardar transacción'
    } finally {
      loading.value = false
    }
  }

  // --- LISTAR DEL DÍA ---
  const fetchToday = async () => {
    loading.value = true
    error.value = null

    try {
      const api = useAxios() // ✅ AQUÍ

      const res = await api.get('/api/transactions/day')
      today.value = (res.data.data ?? []).map(t => ({
        id: t.id,
        client_name: t.client_name || 'Sin nombre',
        moneda: t.moneda || '-',
        grams: parseFloat(t.grams ?? 0),
        total_pen: parseFloat(t.total_pen ?? 0),
        total_usd: parseFloat(t.total_usd ?? 0),
        total_bob: parseFloat(t.total_bob ?? 0),
        created_at: t.created_at || '-'
      }))
    } catch (e) {
      console.error('❌ Error al cargar:', e)
      error.value = 'No se pudo cargar las transacciones'
      today.value = []
    } finally {
      loading.value = false
    }
  }

  // --- ELIMINAR ---
  const remove = async (id) => {
    if (!confirm('¿Eliminar esta transacción?')) return

    loading.value = true
    try {
      const api = useAxios() // ✅ AQUÍ

      await getCsrfToken()
      await api.delete(`/api/transactions/${id}`)
      today.value = today.value.filter(t => t.id !== id)
      success.value = 'Transacción eliminada'
    } catch (e) {
      console.error('❌ Error al eliminar:', e)
      error.value = 'Error al eliminar'
    } finally {
      loading.value = false
    }
  }

  // --- TOTALES ---
  const totals = computed(() => {
    const totalPEN = today.value.reduce((s, t) => s + (t.total_pen || 0), 0)
    const totalUSD = today.value.reduce((s, t) => s + (t.total_usd || 0), 0)
    const totalBOB = today.value.reduce((s, t) => s + (t.total_bob || 0), 0)
    const totalGrams = today.value.reduce((s, t) => s + (t.grams || 0), 0)

    return { totalPEN, totalUSD, totalBOB, totalGrams }
  })

  return {
    loading,
    error,
    success,
    today,
    inputs,
    moneda,
    precioGramo,
    totalMoneda,
    computedResults,
    totals,
    saveGoldCalculation,
    fetchToday,
    remove,
    clearAll,
    setValue
  }
})
