<template>
  <div class="p-6 space-y-10 bg-white min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800">Dashboard Administrador - Precio del Oro</h1>

    <!-- Cards con KPIs e íconos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="card in kpiCards"
        :key="card.title"
        class="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-100"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-gray-500 text-sm">{{ card.title }}</h2>
            <p class="text-2xl font-semibold text-gray-800">{{ card.value }}</p>
            <p
              v-if="card.growth !== undefined"
              class="text-xs mt-1"
              :class="card.growth >= 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ card.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(card.growth) }}%
            </p>
          </div>
          <component :is="card.icon" class="w-8 h-8 text-yellow-500" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-4 shadow flex flex-col items-center">
        <h3 class="text-sm font-semibold mb-3 text-gray-700 text-center">
          Precio del Oro (Últimos Días)
        </h3>
        <div class="w-[80%] max-w-[300px] h-[160px]">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow flex flex-col items-center">
        <h3 class="text-sm font-semibold mb-3 text-gray-700 text-center">
          Distribución de Usuarios
        </h3>
        <div class="w-[60%] max-w-[180px] h-[160px]">
          <Pie :data="pieChartData" :options="pieChartOptions" />
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="bg-white p-6 rounded-2xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Usuarios Registrados</h2>
        <button
          @click="showAddUserForm"
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          ➕ Añadir Usuario
        </button>
      </div>

      <div class="flex flex-wrap gap-4 mb-4">
        <select v-model="searchField" class="p-2 border rounded">
          <option value="name">Nombre</option>
          <option value="email">Email</option>
        </select>
        <input v-model="searchValue" class="p-2 border rounded flex-1" placeholder="Buscar..." />
      </div>

      <EasyDataTable :headers="headers" :items="filteredUsers" class="custom-table">
        <template #item-action="{ id }">
          <button @click="viewUser(id)" title="Ver">👁️</button>
          <button @click="editUser(id)" title="Editar">✏️</button>
          <button @click="deleteUser(id)" title="Eliminar">🗑️</button>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import EasyDataTable from 'vue3-easy-data-table'
import Swal from 'sweetalert2'
import { DollarSign, Users, TrendingUp, Bell, Archive, Clock } from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

// ---- 🔥 STATE ----
const users = ref([])
const barData = ref({ labels: [], dataset: [] })
const pieData = ref({ labels: [], dataset: [] })
const stats = ref(null)

// ---- KPI Cards ----
const kpiCards = ref([])

// ---- Table ----
const searchField = ref('name')
const searchValue = ref('')
const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Nombre', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'Acciones', value: 'action' }
]

// ---- Fetch data ----
onMounted(async () => {
  try {
    const [statsRes, chartsRes, usersRes] = await Promise.all([
      axios.get('/api/dashboard/stats'),
      axios.get('/api/dashboard/charts'),
      axios.get('/api/dashboard/list-users')
    ])

    stats.value = statsRes.data.data
    barData.value = chartsRes.data.data.bar
    pieData.value = chartsRes.data.data.pie
    users.value = usersRes.data.data.data || usersRes.data.data

    // ✅ KPIs dinámicos
    kpiCards.value = [
      { title: 'Precio Oro Hoy (g)', value: `$${stats.value.precio_hoy_usd || '--'}`, icon: DollarSign },
      { title: 'Promedio Semanal', value: `$${stats.value.promedio_semanal_usd || '--'}`, icon: TrendingUp },
      { title: 'Usuarios Registrados', value: stats.value.users_count, icon: Users },
      { title: 'Consultas Hoy', value: stats.value.consultas_hoy, icon: Clock },
      { title: 'Volumen Vendido', value: `${stats.value.volumen_vendido_grams}g`, icon: Archive },
      { title: 'Alertas Activas', value: stats.value.alerts_active, icon: Bell }
    ]
  } catch (err) {
    console.error('❌ Error cargando dashboard:', err)
    Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error')
  }
})

// ---- Charts ----
const barChartData = computed(() => ({
  labels: barData.value.labels,
  datasets: [
    {
      label: 'Precio en $/g',
      data: barData.value.dataset,
      backgroundColor: '#fbbf24'
    }
  ]
}))

const pieChartData = computed(() => ({
  labels: pieData.value.labels,
  datasets: [
    {
      data: pieData.value.dataset,
      backgroundColor: ['#10b981', '#ef4444']
    }
  ]
}))

const barChartOptions = {
  responsive: true,
  plugins: { legend: { display: false } }
}

const pieChartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } }
}

// ---- Filtro ----
const filteredUsers = computed(() =>
  users.value.filter(user =>
    user[searchField.value]?.toLowerCase().includes(searchValue.value.toLowerCase())
  )
)

// ---- Acciones ----
const findUser = id => users.value.find(u => u.id === id)

const viewUser = id => {
  const u = findUser(id)
  Swal.fire({ title: u.name, text: `Email: ${u.email}`, icon: 'info' })
}

const editUser = async id => {
  const u = findUser(id)
  const { value: newName } = await Swal.fire({
    title: 'Editar nombre',
    input: 'text',
    inputValue: u.name,
    showCancelButton: true
  })
  if (newName) u.name = newName
}

const deleteUser = async id => {
  const u = findUser(id)
  const confirm = await Swal.fire({
    title: '¿Eliminar?',
    text: `Esto eliminará a ${u.name}`,
    icon: 'warning',
    showCancelButton: true
  })
  if (confirm.isConfirmed) users.value = users.value.filter(x => x.id !== id)
}

const showAddUserForm = async () => {
  const { value: f } = await Swal.fire({
    title: 'Nuevo usuario',
    html:
      `<input id="swal-name" class="swal2-input" placeholder="Nombre">` +
      `<input id="swal-email" class="swal2-input" placeholder="Email">`,
    showCancelButton: true,
    preConfirm: () => ({
      name: document.getElementById('swal-name').value,
      email: document.getElementById('swal-email').value
    })
  })
  if (f?.name && f?.email) {
    users.value.push({
      id: Math.max(...users.value.map(u => u.id)) + 1,
      ...f
    })
  }
}
</script>

<style scoped>
.custom-table {
  --easy-table-header-background-color: #1f2937;
  --easy-table-header-text-color: white;
  --easy-table-row-hover-background-color: #f9fafb;
  border-radius: 12px;
}
</style>
