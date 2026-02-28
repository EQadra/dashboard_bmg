<template>
  <div class="min-h-screen bg-[#0b1a33] text-slate-100 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-blue-300 flex items-center gap-2">
        💰 Transacciones del Día
      </h1>
      <button
        @click="fetch"
        class="bg-blue-600 hover:bg-blue-700 transition
               text-white px-3 py-1 rounded-lg text-sm"
      >
        🔄 Refrescar
      </button>
    </div>

    <!-- Acciones -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button @click="fetch" class="btn btn-blue">🔄 Refrescar</button>
      <button @click="openCloseCashModal" class="btn btn-green">🧾 Cerrar Caja</button>
      <button @click="generateReport" class="btn btn-yellow">📊 Generar Reporte</button>
    </div>

    <!-- Estados -->
    <div v-if="loading" class="text-slate-400 italic">
      ⏳ Cargando transacciones...
    </div>
    <div v-if="error" class="text-red-400 font-semibold">
      {{ error }}
    </div>

    <!-- Tabla -->
    <div
      v-if="transactions.length"
      class="overflow-x-auto bg-[#12244a] border border-white/10
             rounded-xl shadow-lg"
    >
      <table class="w-full text-sm">
        <thead class="bg-blue-900/40 text-blue-200">
          <tr>
            <th class="p-3 text-left">#</th>
            <th class="p-3 text-left">Cliente</th>
            <th class="p-3 text-left">Moneda</th>
            <th class="p-3 text-right">Gramos</th>
            <th class="p-3 text-right">Total (PEN)</th>
            <th class="p-3 text-center">Hora</th>
            <th class="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(t, i) in transactions"
            :key="t.id"
            class="border-t border-white/5 hover:bg-blue-900/20 transition"
          >
            <td class="p-3">{{ i + 1 }}</td>
            <td class="p-3">{{ t.client_name || 'Sin nombre' }}</td>
            <td class="p-3">{{ t.moneda }}</td>
            <td class="p-3 text-right">{{ formatNumber(t.grams) }}</td>
            <td class="p-3 text-right font-semibold text-green-400">
              {{ formatNumber(t.total_pen) }}
            </td>
            <td class="p-3 text-center text-slate-300">
              {{ formatDate(t.created_at) }}
            </td>
            <td class="p-3 text-center space-x-3">
              <button @click="openView(t)" class="action view">Ver</button>
              <button @click="openEdit(t)" class="action edit">Editar</button>
              <button @click="removeTransaction(t.id)" class="action delete">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-slate-400 mt-6 italic">
      No hay transacciones registradas hoy.
    </div>

    <!-- Modal Detalle -->
    <Modal v-if="showViewModal" @close="closeModal" title="Detalle de Transacción">
      <div class="space-y-2 text-slate-800">
        <p><strong>Cliente:</strong> {{ selected.client_name }}</p>
        <p><strong>Moneda:</strong> {{ selected.moneda }}</p>
        <p><strong>Gramos:</strong> {{ formatNumber(selected.grams) }}</p>
        <p><strong>Total PEN:</strong> {{ formatNumber(selected.total_pen) }}</p>
        <p><strong>Registrado:</strong> {{ formatDate(selected.created_at) }}</p>
      </div>
    </Modal>

    <!-- Modal Edición -->
    <Modal v-if="showEditModal" @close="closeModal" title="Editar Transacción">
      <form @submit.prevent="submitEdit" class="space-y-3">
        <input v-model="form.client_name" placeholder="Cliente" class="input" />
        <input v-model.number="form.grams" type="number" placeholder="Gramos" class="input" />
        <input v-model.number="form.total_pen" type="number" placeholder="Total PEN" class="input" />
        <select v-model="form.moneda" class="input">
          <option value="PEN">PEN</option>
          <option value="USD">USD</option>
          <option value="BOB">BOB</option>
        </select>
        <button class="btn btn-blue w-full" type="submit">
          💾 Guardar cambios
        </button>
      </form>
    </Modal>

    <!-- Modal Cierre Caja -->
    <Modal v-if="showCloseCashModal" @close="closeModal" title="Cerrar Caja">
      <div class="space-y-4">
        <p class="text-slate-700">
          ¿Seguro que deseas cerrar la caja del día?
        </p>
        <button @click="closeCashRegister" class="btn btn-green w-full">
          ✅ Confirmar Cierre
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionsStore } from '../../stores/useTransactionsStore'
import { formatNumber } from '../../utils/format'
import Modal from '../../components/Modal.vue'

const store = useTransactionsStore()
const { fetchToday, update, remove } = store

const transactions = ref([])
const loading = ref(false)
const error = ref(null)

const showViewModal = ref(false)
const showEditModal = ref(false)
const showCloseCashModal = ref(false)

const selected = ref({})
const form = ref({})

async function fetch() {
  loading.value = true
  error.value = null
  try {
    await fetchToday()
    transactions.value = store.today
  } catch (e) {
    error.value = 'Error al cargar transacciones'
  } finally {
    loading.value = false
  }
}

function openView(t) {
  selected.value = { ...t }
  showViewModal.value = true
}
function openEdit(t) {
  selected.value = { ...t }
  form.value = { ...t }
  showEditModal.value = true
}
function closeModal() {
  showViewModal.value = false
  showEditModal.value = false
  showCloseCashModal.value = false
}
async function submitEdit() {
  await update(form.value.id, form.value)
  closeModal()
  fetch()
}
async function removeTransaction(id) {
  await remove(id)
  fetch()
}

function openCloseCashModal() {
  showCloseCashModal.value = true
}
async function closeCashRegister() {
  try {
    await axios.post('/api/caja/cerrar')
    alert('✅ Caja cerrada correctamente.')
    showCloseCashModal.value = false
    fetch()
  } catch {
    alert('❌ Error al cerrar la caja.')
  }
}

function generateReport() {
  const csv = [
    ['Cliente', 'Moneda', 'Gramos', 'Total PEN', 'Fecha'],
    ...transactions.value.map(t => [
      t.client_name,
      t.moneda,
      t.grams,
      t.total_pen,
      new Date(t.created_at).toLocaleString()
    ])
  ].map(r => r.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return isNaN(d) ? '-' : d.toLocaleTimeString()
}

onMounted(fetch)
</script>

<style scoped>
.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: 0.2s;
}
.btn-blue {
  background: #2563eb;
  color: white;
}
.btn-blue:hover {
  background: #1d4ed8;
}
.btn-green {
  background: #16a34a;
  color: white;
}
.btn-green:hover {
  background: #15803d;
}
.btn-yellow {
  background: #facc15;
  color: #000;
}

.action {
  font-size: 13px;
  text-decoration: underline;
}
.action.view { color: #60a5fa; }
.action.edit { color: #fbbf24; }
.action.delete { color: #f87171; }

.input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
</style>
