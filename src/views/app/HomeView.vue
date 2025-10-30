<template>
  <div class="dashboard">
    <!-- Título -->
    <h1 class="title">Dashboard Administrador ‑ Precio del Oro</h1>

    <!-- KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div
          v-for="card in kpiCards"
          :key="card.title"
          class="kpi-card"
        >
          <div class="kpi-content">
            <div>
              <h2 class="kpi-label">{{ card.title }}</h2>
              <p class="kpi-value">{{ card.value }}</p>
              <p
                v-if="card.growth !== undefined"
                class="kpi-growth"
                :class="card.growth >= 0 ? 'positive' : 'negative'"
              >
                {{ card.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(card.growth) }}%
              </p>
            </div>
            <component :is="card.icon" class="kpi-icon" />
          </div>
        </div>
      </div>
    </section>

    <!-- Gráficas -->
    <section class="section">
      <div class="chart-grid">
        <div class="chart-card">
          <h3 class="chart-title">Precio del Oro (Últimos Días)</h3>
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
        <div class="chart-card">
          <h3 class="chart-title">Distribución de Usuarios</h3>
          <Pie :data="pieChartData" :options="pieChartOptions" />
        </div>
      </div>
    </section>

    <!-- Tabla de usuarios -->
    <section class="section">
      <div class="table-card">
        <div class="table-header">
          <h2 class="table-title">Usuarios Registrados</h2>
          <button @click="showAddUserForm" class="btn-add">
            ➕ Añadir Usuario
          </button>
        </div>

        <div class="search-controls">
          <select v-model="searchField" class="search-input">
            <option value="name">Nombre</option>
            <option value="email">Email</option>
          </select>
          <input
            v-model="searchValue"
            class="search-input flex-grow"
            placeholder="Buscar…"
          />
        </div>

        <EasyDataTable
          :headers="headers"
          :items="filteredUsers"
          class="custom-table"
        >
          <template #item-action="{ id }">
            <button @click="viewUser(id)" title="Ver">👁️</button>
            <button @click="editUser(id)" title="Editar">✏️</button>
            <button @click="deleteUser(id)" title="Eliminar">🗑️</button>
          </template>
        </EasyDataTable>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// Íconos (Lucide)
import {
  DollarSign,
  Users,
  TrendingUp,
  Bell,
  Archive,
  Clock
} from 'lucide-vue-next'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
)

/* ---------------------- Datos ficticios ---------------------- */
const users = ref([
  { id: 1, name: 'Ana Pérez',   email: 'ana@example.com'    },
  { id: 2, name: 'Carlos López', email: 'carlos@example.com' },
  { id: 3, name: 'Luisa Gómez',  email: 'luisa@example.com'  }
])

const kpiCards = ref([
  { title: 'Precio Oro Hoy (g)', value: '$68.90', growth: 1.2, icon: DollarSign },
  { title: 'Promedio Semanal',  value: '$67.50', growth: 2.3, icon: TrendingUp },
  { title: 'Usuarios Registrados', value: users.value.length, icon: Users },
  { title: 'Consultas Hoy',     value: 45,  growth: -1.1, icon: Clock },
  { title: 'Volumen Vendido',   value: '1.2 kg', icon: Archive },
  { title: 'Alertas Activas',   value: 2,   icon: Bell }
])

/* ---------------------- Búsqueda ---------------------- */
const searchField = ref('name')
const searchValue = ref('')

const filteredUsers = computed(() =>
  users.value.filter(user =>
    user[searchField.value]
      ?.toLowerCase()
      .includes(searchValue.value.toLowerCase())
  )
)

/* ------------------------ Tabla ------------------------ */
const headers = [
  { text: 'ID',     value: 'id'   },
  { text: 'Nombre', value: 'name' },
  { text: 'Email',  value: 'email' },
  { text: 'Acciones', value: 'action' }
]

/* ---------------------- Gráfica: Bar ---------------------- */
const barChartData = computed(() => ({
  labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
  datasets: [
    {
      label: 'Precio en $/g',
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

/* ---------------------- Gráfica: Pie ---------------------- */
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

/* ------------------- Acciones de usuario ------------------- */
const findUser = id => users.value.find(u => u.id === id)

const viewUser = id => {
  const user = findUser(id)
  Swal.fire({
    title: `Usuario: ${user.name}`,
    text: `Email: ${user.email}`,
    icon: 'info'
  })
}

const editUser = async id => {
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

const deleteUser = id => {
  const user = findUser(id)
  Swal.fire({
    title: '¿Estás seguro?',
    text: `Esto eliminará a ${user.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
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
      '<input id="swal-input-name"  class="swal2-input" placeholder="Nombre">' +
      '<input id="swal-input-email" class="swal2-input" placeholder="Email">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    preConfirm: () => {
      const name  = document.getElementById('swal-input-name').value
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
/* ---------- Layout general ---------- */
.dashboard {
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

/* Espaciado entre secciones (space‑y‑10) */
.section + .section {
  margin-top: 2.5rem;
}

/* ---------- KPI Cards ---------- */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {   /*  sm */
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {  /*  lg */
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.kpi-card {
  background: #ffffff;
  padding: 1.25rem;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.kpi-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.kpi-growth {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.positive { color: #10b981; } /* verde */
.negative { color: #ef4444; } /* rojo */

.kpi-icon {
  width: 2rem;
  height: 2rem;
  color: #fbbf24;            /* amarillo */
}

/* ---------- Cards de gráficas ---------- */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {   /*  md */
  .chart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* ---------- Tabla de usuarios ---------- */
.table-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-add {
  background: #10b981;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-add:hover {
  background: #059669;
}

/* ---------- Controles de búsqueda ---------- */
.search-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-width: 150px;
  box-sizing: border-box;
}

.flex-grow {
  flex: 1 1 auto;
}

/* ---------- DataTable (vars) ---------- */
.custom-table {
  --easy-table-header-background-color: #1f2937;
  --easy-table-header-text-color: #ffffff;
  --easy-table-row-hover-background-color: #f9fafb;
  border-radius: 12px;
}
</style>
