<template>
  <div class="min-h-screen bg-[#0b1a33] text-slate-100 font-[Inter] p-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- IZQUIERDA: FORMULARIO -->
      <div class="flex flex-col gap-6">
        <h1 class="text-3xl font-bold text-blue-300 tracking-tight mb-1">
          Calculadora de Oro
        </h1>
        <p class="text-slate-400 text-sm mb-4">
          Gestión de cotización y transacciones
        </p>

        <div class="bg-[#12244a] border border-white/10 rounded-2xl shadow-lg p-6 space-y-5">

          <!-- Cliente -->
          <div>
            <label class="font-semibold text-slate-300 text-sm">
              Cliente / Empresa
            </label>
            <input
              v-model="store.inputs.clientName"
              placeholder="Nombre del cliente"
              class="w-full bg-[#0b1a33] border border-white/10 rounded-lg p-2 mt-1
                     text-slate-100 placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Tipo de Venta -->
          <div>
            <label class="font-semibold text-slate-300 text-sm">
              Tipo de Venta
            </label>
            <div class="flex gap-3 mt-2">
              <button
                v-for="val in ['0', '1']"
                :key="val"
                @click="store.setValue('tipoVenta', val)"
                class="flex-1 py-2 rounded-lg border font-semibold transition"
                :class="store.inputs.tipoVenta === val
                  ? 'bg-blue-600 text-white'
                  : 'border-blue-400 text-blue-300 hover:bg-blue-500/10'"
              >
                {{ val === '0' ? 'Regular' : 'Empresa' }}
              </button>
            </div>
          </div>

          <!-- Moneda -->
          <div>
            <label class="font-semibold text-slate-300 text-sm">
              Moneda
            </label>
            <div class="flex gap-3 mt-2">
              <button
                v-for="val in ['PEN', 'BOB']"
                :key="val"
                @click="store.moneda = val"
                class="flex-1 py-2 rounded-lg border font-semibold transition"
                :class="store.moneda === val
                  ? 'bg-green-600 text-white'
                  : 'border-green-400 text-green-300 hover:bg-green-500/10'"
              >
                {{ val === 'PEN' ? 'Soles (PEN)' : 'Bolivianos (BOB)' }}
              </button>
            </div>
          </div>

          <!-- Campos numéricos -->
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(label, key) in fieldLabels" :key="key">
              <label class="font-semibold text-slate-300 text-sm">
                {{ label }}
              </label>
              <input
                v-model="store.inputs[key]"
                :placeholder="placeholders[key]"
                type="number"
                step="any"
                class="w-full bg-[#0b1a33] border border-white/10 rounded-lg p-2 mt-1
                       text-slate-100 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- DERECHA: RESULTADOS Y ACCIONES -->
      <div class="flex flex-col gap-6">

        <!-- Resultados -->
        <div
          v-if="store.computedResults.valido"
          class="bg-[#12244a] border border-green-400/30 rounded-2xl shadow-lg p-6"
        >
          <h2 class="text-xl font-bold text-green-300 mb-4">
            Resultados
          </h2>
          <ul class="space-y-2 text-sm text-slate-300">
            <li><strong>Precio x gr ({{ store.moneda }}):</strong> {{ formatNumber(store.precioGramo) }}</li>
            <li><strong>Gramos:</strong> {{ formatNumber(store.inputs.grams) }}</li>
            <li><strong>Total ({{ store.moneda }}):</strong> {{ formatNumber(store.totalMoneda) }}</li>
          </ul>
        </div>

        <!-- Botones -->
        <div class="flex flex-wrap gap-3">
          <button
            @click="store.clearAll"
            class="flex-1 py-3 bg-white/10 text-slate-200 rounded-lg font-bold hover:bg-white/20"
          >
            Limpiar
          </button>

          <button
            @click="store.saveGoldCalculation"
            :disabled="loading"
            class="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold
                   hover:bg-green-700 disabled:opacity-40"
          >
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>

          <button
            @click="showModal = true"
            :disabled="!store.computedResults.valido"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold
                   hover:bg-blue-700 disabled:opacity-40"
          >
            Ver Recibo
          </button>
        </div>

        <!-- Mensajes -->
        <div
          v-if="store.success"
          class="p-3 bg-green-500/10 text-green-300 rounded-lg text-sm border border-green-400/20"
        >
          {{ store.success }}
        </div>

        <div
          v-if="store.error"
          class="p-3 bg-red-500/10 text-red-300 rounded-lg text-sm border border-red-400/20"
        >
          {{ store.error }}
        </div>
      </div>
    </div>

    <!-- MODAL RECIBO -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
    >
      <div class="bg-[#12244a] text-slate-100 rounded-xl p-6 w-11/12 max-w-md shadow-xl">
        <h3 class="text-center font-bold text-lg mb-2 text-blue-300">
          Recibo Calculado
        </h3>

        <hr class="my-3 border-white/10" />

        <p v-if="store.inputs.clientName"><strong>Cliente:</strong> {{ store.inputs.clientName }}</p>
        <p><strong>Tipo Venta:</strong> {{ store.inputs.tipoVenta === '0' ? 'Regular' : 'Empresa' }}</p>
        <p><strong>Moneda:</strong> {{ store.moneda }}</p>

        <hr class="my-3 border-white/10" />

        <p><strong>Precio x gr:</strong> {{ formatNumber(store.precioGramo) }}</p>
        <p><strong>Gramos:</strong> {{ formatNumber(store.inputs.grams) }}</p>
        <p><strong>Total:</strong> {{ formatNumber(store.totalMoneda) }} {{ store.moneda }}</p>

        <hr class="my-3 border-white/10" />

        <p class="text-center text-sm text-slate-400">
          Gracias por su compra
        </p>

        <div class="flex gap-2 mt-4">
          <button
            @click="showModal = false"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold"
          >
            Cerrar
          </button>
          <button
            @click="imprimirRecibo"
            class="flex-1 bg-white/10 hover:bg-white/20 rounded-lg py-2"
          >
            Imprimir
          </button>
          <button
            @click="copiarRecibo"
            class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg py-2 font-semibold"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTransactionsStore } from '../../stores/useTransactionsStore'
import { formatNumber } from '../../utils/format'
import Swal from 'sweetalert2'

const store = useTransactionsStore()
const showModal = ref(false)
const loading = ref(false)

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

const imprimirRecibo = () => window.print()

const copiarRecibo = () => {
  const hora = new Date().toLocaleString('es-PE')
  const text = `
------- RECIBO -------
Cliente: ${store.inputs.clientName || 'N/A'} - ${hora}
---------------------
Precio x gr: ${formatNumber(store.precioGramo)} ${store.moneda}
Gramos: ${formatNumber(store.inputs.grams)}
Total: ${formatNumber(store.totalMoneda)} ${store.moneda}
Gracias por su compra
  `.trim()

  navigator.clipboard.writeText(text)
  Swal.fire('Copiado', 'Recibo copiado al portapapeles', 'success')
}
</script>
