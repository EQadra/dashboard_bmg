// FILE: src/stores/calculator.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { calcularValores } from '../utils/calculadora'

export const useCalculatorStore = defineStore('calculator', () => {
  // 🧮 Estado inicial
  const inputs = ref({
    clientName: '',
    pricePerOz: '',
    exchangeRate: '',
    purity: '',
    grams: '',
    discountPercentage: '',
    tipoVenta: '0',
  })

  // 💰 Moneda y tipo de cambio
  const moneda = ref('PEN')
  const tipoCambioBOB = ref(0.73)

  // ✅ Setear un valor específico
  const setValue = (key, value) => {
    inputs.value[key] = value
  }

  // ♻️ Limpiar todos los campos
  const clearAll = () => {
    inputs.value = {
      clientName: '',
      pricePerOz: '',
      exchangeRate: '',
      purity: '',
      grams: '',
      discountPercentage: '',
      tipoVenta: '0',
    }
  }

  // 🧠 Cálculos derivados
  const computedResults = computed(() => calcularValores(inputs.value))

  // 💾 (Opcional) Guardar automáticamente el estado local
  watch(inputs, (val) => {
    localStorage.setItem('calculatorInputs', JSON.stringify(val))
  }, { deep: true })

  // 🔄 Cargar estado guardado al iniciar
  const loadSavedInputs = () => {
    const saved = localStorage.getItem('calculatorInputs')
    if (saved) {
      inputs.value = JSON.parse(saved)
    }
  }

  // ⚡ Inicialización automática
  loadSavedInputs()

  return {
    inputs,
    moneda,
    tipoCambioBOB,
    computedResults,
    setValue,
    clearAll,
    loadSavedInputs,
  }
})
