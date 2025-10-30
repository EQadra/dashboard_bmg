// FILE: src/stores/calculator.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calcularValores } from '../utils/calculadora'


export const useCalculatorStore = defineStore('calculator', () => {
const inputs = ref({
clientName: '',
pricePerOz: '',
exchangeRate: '',
purity: '',
grams: '',
discountPercentage: '',
tipoVenta: '0',
})


const moneda = ref('PEN')
const tipoCambioBOB = ref(0.73)


const setValue = (key, value) => {
inputs.value[key] = value
}


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


const computedResults = computed(() => calcularValores(inputs.value))


return {
inputs,
moneda,
tipoCambioBOB,
setValue,
clearAll,
computedResults,
}
})