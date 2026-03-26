<template>
  <div class="dashboard">
    
    <!-- 🔄 LOADING -->
    <div v-if="dashboard.loading" class="loader">
      Cargando dashboard...
    </div>

    <div v-else>
      <h2 class="header">📊 Dashboard POS</h2>

      <!-- 🔹 STATS PRINCIPALES -->
      <div class="stats">
        <div v-for="(s, i) in dashboard.stats" :key="i" class="card">
          <div class="card-content">
            <div>
              <p class="value">{{ s.value }}</p>
              <p class="label">{{ s.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔥 MÉTRICAS AVANZADAS -->
      <h3 class="chart-title">📊 Métricas Avanzadas</h3>

      <div class="stats grid-6">
        <div v-for="(c, i) in extraCards" :key="i" class="card small">
          <p class="value">{{ c.value }}</p>
          <p class="label">{{ c.label }}</p>
        </div>
      </div>

      <!-- 🔹 GOLD CHART -->
      <h3 class="chart-title">Precio del Oro (7 días)</h3>
      <Line :data="goldChartData" :options="chartOptions" />

      <!-- 🔹 USERS -->
      <h3 class="chart-title">Usuarios Activos</h3>
      <Bar :data="usersChartData" :options="chartOptions" />

      <!-- 🔹 CAJA -->
      <div class="caja">
        <h3>💰 Estado de Caja</h3>
        <p>Apertura: {{ dashboard.caja.apertura }}</p>
        <p>Cierre: {{ dashboard.caja.cierre }}</p>
        <p>Saldo Inicial: S/ {{ dashboard.caja.saldo_inicial }}</p>
        <p>Saldo Actual: S/ {{ dashboard.caja.saldo_actual }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useDashboardStore } from '../../stores/useDashboardStore'

import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

const dashboard = useDashboardStore()

onMounted(() => {
  dashboard.fetchDashboard()
})

/* =========================
   📊 CHARTS
========================= */

// GOLD
const goldChartData = computed(() => ({
  labels: dashboard.charts?.gold?.labels || [],
  datasets: [
    {
      label: 'Oro',
      data: dashboard.charts?.gold?.data || [],
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255,215,0,0.3)'
    }
  ]
}))

// USERS
const usersChartData = computed(() => ({
  labels: dashboard.charts?.users?.labels || [],
  datasets: [
    {
      label: 'Usuarios',
      data: dashboard.charts?.users?.data || [],
      backgroundColor: '#FFD700'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false }
  }
}

/* =========================
   📊 MÉTRICAS AVANZADAS
========================= */

const extraCards = computed(() => {
  const stats = dashboard.stats || []
  const caja = dashboard.caja || {}
  const chart = dashboard.charts?.gold?.data || []

  const ventasPen = stats.find(s => s.label.includes('PEN'))?.value || 0
  const ventasUsd = stats.find(s => s.label.includes('USD'))?.value || 0
  const ventasBob = stats.find(s => s.label.includes('BOB'))?.value || 0
  const transacciones = stats.find(s => s.label.includes('Trans'))?.value || 0

  const totalVentas = ventasPen + ventasUsd + ventasBob
  const promedio = transacciones ? totalVentas / transacciones : 0

  const max = chart.length ? Math.max(...chart) : 0
  const min = chart.length ? Math.min(...chart) : 0
  const ultimo = chart[chart.length - 1] || 0

  return [
    { label: 'Total Ventas', value: totalVentas },
    { label: 'Promedio Venta', value: promedio.toFixed(2) },
    { label: 'Máximo Semana', value: max },
    { label: 'Mínimo Semana', value: min },
    { label: 'Último Registro', value: ultimo },
    { label: 'Registros', value: chart.length },

    { label: 'Caja Actual', value: caja.saldo_actual || 0 },
    { label: 'Saldo Inicial', value: caja.saldo_inicial || 0 },
    { label: 'Transacciones', value: transacciones },
    { label: 'Ventas PEN', value: ventasPen },
    { label: 'Ventas USD', value: ventasUsd },
    { label: 'Ventas BOB', value: ventasBob },
  ]
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #0a1a2f, #1e3c72);
  color: white;
}

.header {
  text-align: center;
  color: #FFD700;
  margin-bottom: 15px;
}

/* LOADER */
.loader {
  text-align: center;
  margin-top: 50px;
}

/* STATS */
.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card {
  width: 48%;
  background: rgba(255,255,255,0.05);
  border: 1px solid #FFD700;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
}

.card.small {
  width: 100%;
  padding: 8px;
  text-align: center;
}

.value {
  font-weight: bold;
  font-size: 16px;
}

.label {
  font-size: 12px;
  color: #aaa;
}

/* GRID 6 */
.grid-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

/* CHARTS */
.chart-title {
  margin: 15px 0 10px;
  color: #FFD700;
}

/* CAJA */
.caja {
  background: white;
  color: black;
  padding: 15px;
  border-radius: 20px;
  margin-top: 20px;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .grid-6 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .grid-6 {
    grid-template-columns: repeat(2, 1fr);
  }

  .card {
    width: 100%;
  }
}
</style>