<template>
  <div class="p-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen font-sans">
    <h1 class="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
      💰 Transacciones del Día
      <button @click="fetch" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
        🔄
      </button>
    </h1>

    <!-- Acciones principales -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button @click="fetch" class="btn-blue">🔄 Refrescar</button>
      <button @click="openCloseCashModal" class="btn-green">🧾 Cerrar Caja</button>
      <button @click="generateReport" class="btn-yellow">📊 Generar Reporte</button>
    </div>

    <!-- Estado -->
    <div v-if="loading" class="text-gray-600 italic">Cargando transacciones...</div>
    <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

    <!-- Lista -->
    <table v-if="transactions.length" class="w-full bg-white rounded-lg shadow border border-gray-200">
      <thead class="bg-blue-800 text-white">
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
        <tr v-for="(t, i) in transactions" :key="t.id" class="border-b hover:bg-blue-50 transition">
          <td class="p-3">{{ i + 1 }}</td>
          <td class="p-3">{{ t.client_name || 'Sin nombre' }}</td>
          <td class="p-3">{{ t.moneda }}</td>
          <td class="p-3 text-right">{{ formatNumber(t.grams) }}</td>
          <td class="p-3 text-right font-semibold text-blue-700">{{ formatNumber(t.total_pen) }}</td>
          <td class="p-3 text-center">{{ formatDate(t.created_at) }}</td>
          <td class="p-3 text-center space-x-3">
            <button @click="openView(t)" class="text-blue-600 hover:underline">Ver</button>
            <button @click="openEdit(t)" class="text-amber-600 hover:underline">Editar</button>
            <button @click="removeTransaction(t.id)" class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-gray-600 mt-6">No hay transacciones registradas hoy.</div>

    <!-- Modal Detalle -->
    <Modal v-if="showViewModal" @close="closeModal" title="Detalle de Transacción">
      <div class="space-y-2 text-gray-800">
        <p><strong>Cliente:</strong> {{ selected.client_name }}</p>
        <p><strong>Moneda:</strong> {{ selected.moneda }}</p>
        <p><strong>Gramos:</strong> {{ formatNumber(selected.grams) }}</p>
        <p><strong>Total PEN:</strong> {{ formatNumber(selected.total_pen) }}</p>
        <p><strong>Registrado:</strong> {{ formatDate(selected.created_at) }}</p>
      </div>
    </Modal>

    <!-- Modal Edición -->
    <Modal v-if="showEditModal" @close="closeModal" title="Editar Transacción">
      <form @submit.prevent="submitEdit" class="space-y-3 text-gray-800">
        <input v-model="form.client_name" placeholder="Cliente" class="input" />
        <input v-model.number="form.grams" type="number" placeholder="Gramos" class="input" />
        <input v-model.number="form.total_pen" type="number" placeholder="Total PEN" class="input" />
        <select v-model="form.moneda" class="input">
          <option value="PEN">PEN</option>
          <option value="USD">USD</option>
          <option value="BOB">BOB</option>
        </select>
        <button class="btn-blue w-full" type="submit">💾 Guardar cambios</button>
      </form>
    </Modal>

    <!-- Modal Cierre de Caja -->
    <Modal v-if="showCloseCashModal" @close="closeModal" title="Cerrar Caja">
      <div class="text-gray-800 space-y-3">
        <p>¿Seguro que deseas cerrar la caja del día? Esto registrará los balances finales y generará el reporte.</p>
        <button @click="closeCashRegister" class="btn-green w-full">✅ Confirmar Cierre</button>
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

// Cierre de caja
function openCloseCashModal() {
  showCloseCashModal.value = true
}
async function closeCashRegister() {
  try {
    await axios.post('/api/caja/cerrar')
    alert('✅ Caja cerrada y reporte generado correctamente.')
    showCloseCashModal.value = false
    fetch()
  } catch (e) {
    alert('❌ Error al cerrar la caja.')
  }
}

// Generar reporte simple (descarga CSV)
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
  ]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_transacciones_${new Date().toISOString().slice(0, 10)}.csv`
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
.btn-blue {
  background-color: #2563eb;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: 0.2s;
}
.btn-blue:hover {
  background-color: #1d4ed8;
}
.btn-green {
  background-color: #16a34a;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: 0.2s;
}
.btn-green:hover {
  background-color: #15803d;
}
.btn-yellow {
  background-color: #facc15;
  color: #000;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}
.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
</style>
