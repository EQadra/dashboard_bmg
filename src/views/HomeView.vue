<template>
  <div class="p-6 space-y-10 bg-gray-50 min-h-screen">
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
            <p v-if="card.growth !== undefined" class="text-xs mt-1" :class="card.growth >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ card.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(card.growth) }}%
            </p>
          </div>
          <component :is="card.icon" class="w-8 h-8 text-yellow-500" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-4 shadow">
        <h3 class="text-lg font-semibold mb-2">Precio del Oro (Últimos Días)</h3>
        <Bar :data="barChartData" :options="barChartOptions" />
      </div>
      <div class="bg-white rounded-2xl p-4 shadow">
        <h3 class="text-lg font-semibold mb-2">Distribución de Usuarios</h3>
        <Pie :data="pieChartData" :options="pieChartOptions" />
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="bg-white p-6 rounded-2xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Usuarios Registrados</h2>
        <button @click="showAddUserForm" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
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
import { ref, computed } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale } from 'chart.js'
import EasyDataTable from 'vue3-easy-data-table'
import Swal from 'sweetalert2'

// Íconos (Lucide por ejemplo)
import { DollarSign, Users, TrendingUp, Bell, Archive, Clock } from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

// Usuarios ficticios
const users = ref([
  { id: 1, name: 'Ana Pérez', email: 'ana@example.com' },
  { id: 2, name: 'Carlos López', email: 'carlos@example.com' },
  { id: 3, name: 'Luisa Gómez', email: 'luisa@example.com' }
])

// Cards con íconos
const kpiCards = ref([
  { title: 'Precio Oro Hoy (g)', value: '$68.90', growth: 1.2, icon: DollarSign },
  { title: 'Promedio Semanal', value: '$67.50', growth: 2.3, icon: TrendingUp },
  { title: 'Usuarios Registrados', value: users.value.length, icon: Users },
  { title: 'Consultas Hoy', value: 45, growth: -1.1, icon: Clock },
  { title: 'Volumen Vendido', value: '1.2kg', icon: Archive },
  { title: 'Alertas Activas', value: 2, icon: Bell }
])

// Search
const searchField = ref('name')
const searchValue = ref('')
const filteredUsers = computed(() =>
  users.value.filter(user =>
    user[searchField.value]?.toLowerCase().includes(searchValue.value.toLowerCase())
  )
)

// Headers para la tabla
const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Nombre', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'Acciones', value: 'action' }
]

// Chart: Bar
const barChartData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Precio en $/g',
      data: [67.8, 68.1, 67.5, 68.9, 69.2, 68.3, 68.9],
      backgroundColor: '#fbbf24'
    }
  ]
}))

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Tendencia del precio del oro',
      font: { size: 14 }
    }
  }
}

// Chart: Pie
const pieChartData = computed(() => ({
  labels: ['Activos', 'Inactivos'],
  datasets: [
    {
      data: [users.value.length - 1, 1],
      backgroundColor: ['#10b981', '#ef4444']
    }
  ]
}))

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: {
      display: true,
      text: 'Estado de usuarios',
      font: { size: 14 }
    }
  }
}

// Acciones de usuario
const findUser = (id) => users.value.find(u => u.id === id)

const viewUser = (id) => {
  const user = findUser(id)
  Swal.fire({
    title: `Usuario: ${user.name}`,
    text: `Email: ${user.email}`,
    icon: 'info'
  })
}

const editUser = async (id) => {
  const user = findUser(id)
  const { value: newName } = await Swal.fire({
    title: 'Editar nombre',
    input: 'text',
    inputLabel: 'Nuevo nombre',
    inputValue: user.name,
    showCancelButton: true
  })
  if (newName) {
    user.name = newName
    Swal.fire('Actualizado', 'El nombre ha sido actualizado', 'success')
  }
}

const deleteUser = (id) => {
  const user = findUser(id)
  Swal.fire({
    title: '¿Estás seguro?',
    text: `Esto eliminará a ${user.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      users.value = users.value.filter(u => u.id !== id)
      Swal.fire('Eliminado', 'El usuario fue eliminado', 'success')
    }
  })
}

const showAddUserForm = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Agregar Nuevo Usuario',
    html:
      `<input id="swal-input-name" class="swal2-input" placeholder="Nombre">` +
      `<input id="swal-input-email" class="swal2-input" placeholder="Email">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    preConfirm: () => {
      const name = document.getElementById('swal-input-name').value
      const email = document.getElementById('swal-input-email').value
      if (!name || !email) {
        Swal.showValidationMessage('Todos los campos son obligatorios')
        return
      }
      return { name, email }
    }
  })

  if (formValues) {
    const newId = users.value.length
      ? Math.max(...users.value.map(u => u.id)) + 1
      : 1

    users.value.push({ id: newId, ...formValues })
    Swal.fire('Agregado', 'Nuevo usuario agregado', 'success')
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
