<template>
  <div class="p-6 space-y-10 bg-white min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800">
      Dashboard Administrador - Precio del Oro
    </h1>

    <!-- Cards con KPIs -->
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
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '../stores/useDashboardStore'
import Swal from 'sweetalert2'
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
import { DollarSign, TrendingUp, Bell, Archive, Clock } from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

// ---- 🧠 STORE ----
const dashboard = useDashboardStore()

// ---- 📊 Cargar datos ----
onMounted(async () => {
  try {
    await dashboard.fetchDashboardData()
  } catch (err) {
    console.error('❌ Error cargando dashboard:', err)
    Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error')
  }
})

// ---- 🧮 Computed ----
const stats = computed(() => dashboard.userStats || {})
const goldPrices = computed(() => dashboard.goldPrices || [])

// ---- 💰 Charts ----
const barChartData = computed(() => ({
  labels: goldPrices.value.map(item => item.date || ''),
  datasets: [
    {
      label: 'Precio en $/g',
      data: goldPrices.value.map(item => item.price_usd || 0),
      backgroundColor: '#fbbf24'
    }
  ]
}))

const pieChartData = computed(() => ({
  labels: ['Activos', 'Inactivos'],
  datasets: [
    {
      data: [stats.value.activos || 0, stats.value.inactivos || 0],
      backgroundColor: ['#10b981', '#ef4444']
    }
  ]
}))

const barChartOptions = { responsive: true, plugins: { legend: { display: false } } }
const pieChartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } }

// ---- 💡 KPI Cards ----
const kpiCards = computed(() => [
  { title: 'Precio Oro Hoy (g)', value: `$${stats.value.precio_hoy_usd || '--'}`, icon: DollarSign },
  { title: 'Promedio Semanal', value: `$${stats.value.promedio_semanal_usd || '--'}`, icon: TrendingUp },
  { title: 'Consultas Hoy', value: stats.value.consultas_hoy || 0, icon: Clock },
  { title: 'Volumen Vendido', value: `${stats.value.volumen_vendido_grams || 0}g`, icon: Archive },
  { title: 'Alertas Activas', value: stats.value.alerts_active || 0, icon: Bell }
])
</script>
