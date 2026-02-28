<template>
  <div class="min-h-screen bg-[#0b1a33] flex items-start justify-center p-6 text-slate-100">
    <div
      class="w-full max-w-lg bg-[#12244a] border border-white/10
             rounded-2xl shadow-xl p-6"
    >
      <h2 class="text-2xl font-bold text-center text-blue-300 mb-6">
        🧾 Gestión de Caja
      </h2>

      <!-- Cargando -->
      <div v-if="store.loading" class="text-center text-slate-400 py-10">
        ⏳ Procesando...
      </div>

      <!-- Caja abierta -->
      <div v-else-if="store.cashRegister && !store.cashRegister.closing_cash_pen">
        <h3 class="text-lg font-semibold text-green-400 mb-4">
          ✅ Caja abierta hoy
        </h3>

        <div class="space-y-1 text-sm text-slate-200">
          <p><strong>📅 Fecha:</strong> {{ store.cashRegister.date }}</p>
          <p><strong>💰 PEN:</strong> {{ store.cashRegister.opening_cash_pen }}</p>
          <p><strong>🇧🇴 BOB:</strong> {{ store.cashRegister.opening_cash_bob }}</p>
          <p><strong>💵 USD:</strong> {{ store.cashRegister.opening_cash_usd }}</p>
          <p><strong>🏅 Oro:</strong> {{ store.cashRegister.opening_gold }} g</p>
          <p><strong>👤 Abierta por:</strong> {{ store.cashRegister.opened_by }}</p>
        </div>

        <button
          @click="mostrarModalCerrar = true"
          class="mt-6 w-full bg-red-600 hover:bg-red-700 transition
                 text-white py-2 rounded-lg font-semibold"
        >
          🔒 Cerrar Caja
        </button>
      </div>

      <!-- Apertura -->
      <div v-else>
        <form @submit.prevent="abrirCaja" class="space-y-4">
          <h3 class="text-lg font-semibold text-blue-300">
            🟩 Apertura de Caja
          </h3>

          <div v-for="(label, key) in {
            opening_cash_pen: '💵 Efectivo (PEN)',
            opening_cash_bob: '🇧🇴 Efectivo (BOB)',
            opening_cash_usd: '💵 Efectivo (USD)',
            opening_gold: '🏅 Oro Inicial (g)'
          }" :key="key">
            <label class="block text-sm text-slate-300 mb-1">{{ label }}</label>
            <input
              type="number"
              v-model.number="form[key]"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-[#0b1a33] border border-white/10 rounded-lg p-2
                     text-slate-100 placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="key === 'opening_cash_pen' || key === 'opening_gold'"
            />
          </div>

          <div class="flex justify-between pt-4">
            <button
              type="submit"
              :disabled="store.loading"
              class="bg-green-600 hover:bg-green-700 transition
                     text-white px-4 py-2 rounded-lg font-semibold
                     disabled:opacity-50"
            >
              {{ store.loading ? '⏳ Procesando...' : '✅ Abrir Caja' }}
            </button>

            <button
              type="button"
              @click="resetForm"
              class="bg-slate-600 hover:bg-slate-500 transition
                     text-white px-4 py-2 rounded-lg"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal cierre -->
    <div
      v-if="mostrarModalCerrar"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-[#12244a] border border-white/10 rounded-2xl
               shadow-xl w-full max-w-md p-6"
      >
        <h3 class="text-lg font-semibold text-red-400 mb-4">
          🔒 Cerrar Caja
        </h3>

        <form @submit.prevent="cerrarCaja" class="space-y-3">
          <div v-for="(label, key) in {
            closing_cash_pen: '💵 Efectivo Final (PEN)',
            closing_cash_bob: '🇧🇴 Efectivo Final (BOB)',
            closing_cash_usd: '💵 Efectivo Final (USD)',
            closing_gold: '🏅 Oro Final (g)'
          }" :key="key">
            <label class="block text-sm text-slate-300 mb-1">{{ label }}</label>
            <input
              type="number"
              v-model.number="cierre[key]"
              min="0"
              step="0.01"
              class="w-full bg-[#0b1a33] border border-white/10 rounded-lg p-2
                     text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="key === 'closing_cash_pen' || key === 'closing_gold'"
            />
          </div>

          <div class="flex justify-between pt-4">
            <button
              type="button"
              @click="mostrarModalCerrar = false"
              class="bg-slate-600 hover:bg-slate-500 transition
                     text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-red-600 hover:bg-red-700 transition
                     text-white px-4 py-2 rounded-lg font-semibold"
            >
              Confirmar Cierre
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useCashRegisterStore } from '../../stores/useCashRegisterStore'

const store = useCashRegisterStore()
const mostrarModalCerrar = ref(false)

const form = reactive({
  opening_cash_pen: 0,
  opening_cash_bob: 0,
  opening_cash_usd: 0,
  opening_gold: 0,
})

const cierre = reactive({
  closing_cash_pen: 0,
  closing_cash_bob: 0,
  closing_cash_usd: 0,
  closing_gold: 0,
})

onMounted(() => {
  store.fetchToday()
})

async function abrirCaja() {
  try {
    await store.openCash({ ...form })
    Swal.fire({
      icon: 'success',
      title: 'Caja abierta correctamente 🎉',
      timer: 1500,
      showConfirmButton: false,
    })
    resetForm()
    store.fetchToday()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error al abrir caja',
      text: err.response?.data?.message || 'Ocurrió un error inesperado.',
    })
  }
}

async function cerrarCaja() {
  try {
    await store.closeCash({ ...cierre })
    Swal.fire({
      icon: 'success',
      title: 'Caja cerrada correctamente 🔒',
      timer: 1500,
      showConfirmButton: false,
    })
    mostrarModalCerrar.value = false
    store.fetchToday()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error al cerrar caja',
      text: err.response?.data?.message || 'Ocurrió un error inesperado.',
    })
  }
}

function resetForm() {
  Object.keys(form).forEach((k) => (form[k] = 0))
}
</script>
