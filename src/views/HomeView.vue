<template>
  <div class="dashboard">
    <h1 class="title">
      Dashboard Administrador - Precio del Oro
    </h1>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div
        v-for="card in kpiCards"
        :key="card.title"
        class="kpi-card"
      >
        <div class="kpi-content">
          <div>
            <h2 class="kpi-title">{{ card.title }}</h2>
            <p class="kpi-value">{{ card.value }}</p>

            <p
              v-if="card.growth !== undefined"
              class="kpi-growth"
              :class="card.growth >= 0 ? 'up' : 'down'"
            >
              {{ card.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(card.growth) }}%
            </p>
          </div>

          <component :is="card.icon" class="kpi-icon" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">
          Precio del Oro (Últimos Días)
        </h3>
        <div class="chart-container">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">
          Distribución de Usuarios
        </h3>
        <div class="chart-container small">
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
)

// 🧠 STORE
const dashboard = useDashboardStore()

// 📊 DATA
onMounted(async () => {
  try {
    await dashboard.fetchDashboardData()
    console.log('✅ Dashboard data cargada')
  } catch (err) {
    console.error('❌ Error dashboard:', err)
    Swal.fire('Error', 'No se pudieron cargar los datos', 'error')
  }
})

const stats = computed(() => dashboard.userStats || {})
const goldPrices = computed(() => dashboard.goldPrices || [])

// 📈 Charts
const barChartData = computed(() => ({
  labels: goldPrices.value.map(i => i.date || ''),
  datasets: [
    {
      label: 'Precio en $/g',
      data: goldPrices.value.map(i => i.price_usd || 0),
      backgroundColor: '#f4c430'
    }
  ]
}))

const pieChartData = computed(() => ({
  labels: ['Activos', 'Inactivos'],
  datasets: [
    {
      data: [stats.value.activos || 0, stats.value.inactivos || 0],
      backgroundColor: ['#22c55e', '#ef4444']
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

// 💡 KPIs
const kpiCards = computed(() => [
  { title: 'Precio Oro Hoy (g)', value: `$${stats.value.precio_hoy_usd || '--'}`, icon: DollarSign },
  { title: 'Promedio Semanal', value: `$${stats.value.promedio_semanal_usd || '--'}`, icon: TrendingUp },
  { title: 'Consultas Hoy', value: stats.value.consultas_hoy || 0, icon: Clock },
  { title: 'Volumen Vendido', value: `${stats.value.volumen_vendido_grams || 0}g`, icon: Archive },
  { title: 'Alertas Activas', value: stats.value.alerts_active || 0, icon: Bell }
])
</script>

<style scoped>
.dashboard {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 32px;
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(0,0,0,.05);
}

.kpi-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-title {
  font-size: 14px;
  color: #6b7280;
}

.kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.kpi-growth {
  font-size: 12px;
  margin-top: 4px;
}

.kpi-growth.up { color: #16a34a; }
.kpi-growth.down { color: #dc2626; }

.kpi-icon {
  width: 32px;
  height: 32px;
  color: #f4c430;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,.05);
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  margin-bottom: 12px;
}

.chart-container {
  height: 180px;
}

.chart-container.small {
  height: 160px;
}
</style>
