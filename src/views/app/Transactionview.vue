<template>
  <div
    :style="{
      background: darkMode
        ? 'linear-gradient(180deg, #0a1a2f, #1e3c72)'
        : 'linear-gradient(180deg, #1e3a8a, #2563eb)',
      minHeight: '100vh',
      padding: '20px',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
    }"
  >
    <div class="max-w-lg mx-auto flex flex-col gap-4">
      <!-- Título -->
      <h1 class="text-center font-bold text-2xl">💰 Calculadora de Oro</h1>

      <!-- Ticker -->
      <div class="bg-yellow-400 p-2 rounded-lg overflow-hidden">
        <div
          ref="ticker"
          :style="{ transform: `translateX(-${offset}px)`, transition: 'transform 0.05s linear', color: '#000', fontWeight: 'bold', whiteSpace: 'nowrap' }"
        >
          <span v-for="(item, i) in repeatedTicker" :key="i" class="mr-4">
            {{ item }} •••
          </span>
        </div>
      </div>

      <!-- Formulario -->
      <div class="bg-[#000033] border-2 border-yellow-400 rounded-2xl p-4 space-y-3">
        <!-- Cliente -->
        <div>
          <label class="font-bold text-white">Cliente / Empresa</label>
          <input
            v-model="store.inputs.clientName"
            placeholder="Nombre del cliente"
            class="w-full bg-black text-green-400 border border-green-400 rounded-md p-2"
          />
        </div>

        <!-- Tipo de venta -->
        <div class="flex gap-2">
          <button
            v-for="val in ['0', '1']"
            :key="val"
            @click="store.setValue('tipoVenta', val)"
            class="flex-1 py-2 rounded-lg font-bold border border-yellow-400 transition"
            :style="{
              backgroundColor: store.inputs.tipoVenta === val ? '#FFD700' : 'transparent',
              color: store.inputs.tipoVenta === val ? '#000' : '#FFD700',
            }"
          >
            {{ val === '0' ? 'Venta Regular' : 'Venta Empresa' }}
          </button>
        </div>

        <!-- Moneda -->
        <div class="flex gap-2">
          <button
            v-for="val in ['PEN', 'BOB']"
            :key="val"
            @click="store.moneda = val"
            class="flex-1 py-2 rounded-lg font-bold border border-yellow-400 transition"
            :style="{
              backgroundColor: store.moneda === val ? '#FFD700' : 'transparent',
              color: store.moneda === val ? '#000' : '#FFD700',
            }"
          >
            {{ val === 'PEN' ? 'Soles (PEN)' : 'Bolivianos (BOB)' }}
          </button>
        </div>

        <!-- Inputs dinámicos -->
        <div v-for="(label, key) in fieldLabels" :key="key">
          <label class="font-bold text-white">{{ label }}</label>
          <input
            v-model="store.inputs[key]"
            :placeholder="placeholders[key]"
            class="w-full bg-black text-green-400 border border-green-400 rounded-md p-2"
          />
        </div>
      </div>

      <!-- Resultados -->
      <div
        v-if="store.computedResults.valido"
        class="bg-[#f8fafc] text-[#1e293b] border-2 border-blue-700 rounded-2xl p-4"
      >
        <p><strong>💲 Precio x gr ({{ store.moneda }}):</strong> {{ formatNumber(precioGramo) }}</p>
        <p><strong>🧾 Total ({{ store.moneda }}):</strong> {{ formatNumber(totalMoneda) }}</p>
      </div>

      <!-- Botones -->
      <div class="flex flex-wrap gap-3 mt-4">
        <button
          @click="store.clearAll"
          class="flex-1 py-3 bg-blue-800 text-white rounded-lg font-bold hover:bg-blue-900"
        >
          Limpiar
        </button>

        <button
          @click="guardarTransaccion"
          class="flex-1 py-3 bg-green-500 text-black rounded-lg font-bold hover:bg-green-600"
        >
          💾 Guardar Transacción
        </button>

        <button
          @click="showModal = true"
          class="flex-1 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500"
        >
          🧾 Ver Recibo
        </button>
      </div>
    </div>

    <!-- Modal Recibo -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white text-gray-800 rounded-xl p-6 w-11/12 max-w-sm border border-gray-300">
        <h3 class="text-center font-bold text-lg mb-2">🧾 Recibo Calculado</h3>
        <hr class="border-dashed border-gray-400 mb-2" />

        <p v-if="store.inputs.clientName"><strong>👤 Cliente:</strong> {{ store.inputs.clientName }}</p>
        <p><strong>Tipo Venta:</strong> {{ store.inputs.tipoVenta === '0' ? 'Regular' : 'Empresa' }}</p>
        <p><strong>Moneda:</strong> {{ store.moneda }}</p>

        <hr class="border-dashed border-gray-400 my-2" />

        <p><strong>💲 Precio x gr:</strong> {{ formatNumber(precioGramo) }}</p>
        <p><strong>⚖️ Gramos:</strong> {{ formatNumber(store.inputs.grams) }}</p>
        <p><strong>🧾 Total:</strong> {{ formatNumber(totalMoneda) }}</p>

        <hr class="border-dashed border-gray-400 my-2" />
        <p class="text-center text-sm text-gray-500">Gracias por su compra</p>

        <div class="flex gap-2 mt-4">
          <button
            @click="showModal = false"
            class="flex-1 bg-blue-700 text-white rounded-lg py-2"
          >
            Cerrar
          </button>
          <button
            @click="imprimirRecibo"
            class="flex-1 bg-gray-200 text-black rounded-lg py-2"
          >
            Imprimir
          </button>
          <button
            @click="copiarRecibo"
            class="flex-1 bg-yellow-400 text-black rounded-lg py-2"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useCalculatorStore } from '../../stores/useCalculatorStore'
import { formatNumber } from '../../utils/format'
import Swal from 'sweetalert2'
import axios from 'axios'

const props = defineProps({ darkMode: Boolean })
const store = useCalculatorStore()
const showModal = ref(false)
const ticker = ref(null)
const offset = ref(0)
let intervalId

// 📰 Noticias en el ticker
const noticias = [
  'Precio del oro sube un 2% esta semana',
  'El dólar se mantiene estable en Perú',
  'Nueva normativa para empresas exportadoras de oro',
]
const repeatedTicker = [...noticias, ...noticias]

onMounted(() => {
  intervalId = setInterval(() => {
    offset.value = (offset.value + 2) % 600
  }, 40)
})
onBeforeUnmount(() => clearInterval(intervalId))

// 💰 Cálculos automáticos
const precioGramo = computed(() => {
  return store.moneda === 'PEN'
    ? store.computedResults.pricePerGramPEN
    : store.computedResults.pricePerGramPEN * store.tipoCambioBOB
})
const totalMoneda = computed(() => {
  return store.moneda === 'PEN'
    ? store.computedResults.totalPEN
    : store.computedResults.totalPEN * store.tipoCambioBOB
})

// 📋 Etiquetas de campos
const fieldLabels = {
  pricePerOz: 'Precio Onza (USD)',
  exchangeRate: 'Tipo Cambio (USD → PEN)',
  purity: 'Ley del Oro',
  discountPercentage: 'Descuento (%)',
  grams: 'Gramos',
}
const placeholders = {
  pricePerOz: 'Ej: 1980.45',
  exchangeRate: 'Ej: 3.75',
  purity: 'Ej: 0.75',
  discountPercentage: 'Ej: 5',
  grams: 'Ej: 10',
}

// 🖨️ Imprimir y Copiar Recibo
const imprimirRecibo = () => window.print()
const copiarRecibo = () => {
  const hora = new Date().toLocaleString()
  const text = `
-------Recibo Calculado--------
Cliente: ${store.inputs.clientName || 'N/A'}
${hora}
---------------------------
Precio x gr: ${formatNumber(precioGramo.value)}
Gramos: ${formatNumber(store.inputs.grams)}
---------------------------
Total: ${formatNumber(totalMoneda.value)}
---------------------------
Gracias por su compra
Este comprobante no es válido para efectos fiscales
  `.trim()
  navigator.clipboard.writeText(text)
  Swal.fire('✅ Copiado', 'Recibo copiado al portapapeles', 'success')
}

// 💾 Guardar Transacción
async function guardarTransaccion() {
  try {
    const payload = {
      grams: store.inputs.grams,
      purity: store.inputs.purity,
      discount_percentage: store.inputs.discountPercentage,
      price_per_oz: store.inputs.pricePerOz,
      exchange_rate: store.inputs.exchangeRate,
      moneda: store.moneda,
      tipo_venta: store.inputs.tipoVenta,
      client_name: store.inputs.clientName,
    }

    const { data } = await axios.post('/api/transacciones', payload)

    Swal.fire({
      icon: 'success',
      title: 'Transacción guardada correctamente 🎉',
      text: `ID: ${data.data.id}`,
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar transacción',
      text: err.response?.data?.message || err.message,
    })
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
  box-shadow: 0 0 6px #00ff99;
}
</style>
