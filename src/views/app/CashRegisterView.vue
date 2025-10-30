<template>
  <div class="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md border">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">
      🧾 Gestión de Caja
    </h2>

    <!-- Estado de carga -->
    <div v-if="store.loading" class="text-center text-gray-500 py-8">
      ⏳ Procesando...
    </div>

    <!-- Si hay caja abierta -->
    <div v-else-if="store.cashRegister && !store.cashRegister.closing_cash_pen">
      <h3 class="text-lg font-semibold text-green-700 mb-3">
        ✅ Caja abierta hoy
      </h3>
      <p><strong>📅 Fecha:</strong> {{ store.cashRegister.date }}</p>
      <p><strong>💰 PEN:</strong> {{ store.cashRegister.opening_cash_pen }}</p>
      <p><strong>🇧🇴 BOB:</strong> {{ store.cashRegister.opening_cash_bob }}</p>
      <p><strong>💵 USD:</strong> {{ store.cashRegister.opening_cash_usd }}</p>
      <p><strong>🏅 Oro:</strong> {{ store.cashRegister.opening_gold }} g</p>
      <p><strong>👤 Abierta por:</strong> {{ store.cashRegister.opened_by }}</p>

      <!-- Botón cerrar -->
      <div class="mt-6">
        <button
          @click="mostrarModalCerrar = true"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full"
        >
          🔒 Cerrar Caja
        </button>
      </div>
    </div>

    <!-- Si no hay caja abierta -->
    <div v-else>
      <form @submit.prevent="abrirCaja" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700">
          🟩 Apertura de Caja
        </h3>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">💵 Efectivo (PEN)</label>
          <input
            type="number"
            v-model.number="form.opening_cash_pen"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">🇧🇴 Efectivo (BOB)</label>
          <input
            type="number"
            v-model.number="form.opening_cash_bob"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">💵 Efectivo (USD)</label>
          <input
            type="number"
            v-model.number="form.opening_cash_usd"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">🏅 Oro Inicial (g)</label>
          <input
            type="number"
            v-model.number="form.opening_gold"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        <div class="flex justify-between items-center mt-6">
          <button
            type="submit"
            :disabled="store.loading"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
          >
            {{ store.loading ? '⏳ Procesando...' : '✅ Abrir Caja' }}
          </button>

          <button
            type="button"
            @click="resetForm"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>

    <!-- Modal Cierre -->
    <div
      v-if="mostrarModalCerrar"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">🔒 Cerrar Caja</h3>

        <form @submit.prevent="cerrarCaja" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">💵 Efectivo Final (PEN)</label>
            <input
              type="number"
              v-model.number="cierre.closing_cash_pen"
              min="0"
              step="0.01"
              class="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🇧🇴 Efectivo Final (BOB)</label>
            <input
              type="number"
              v-model.number="cierre.closing_cash_bob"
              min="0"
              step="0.01"
              class="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">💵 Efectivo Final (USD)</label>
            <input
              type="number"
              v-model.number="cierre.closing_cash_usd"
              min="0"
              step="0.01"
              class="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">🏅 Oro Final (g)</label>
            <input
              type="number"
              v-model.number="cierre.closing_gold"
              min="0"
              step="0.01"
              class="w-full border rounded-md p-2"
              required
            />
          </div>

          <div class="flex justify-between mt-4">
            <button
              type="button"
              @click="mostrarModalCerrar = false"
              class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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
