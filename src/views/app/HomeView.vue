<template>
  <div class="dashboard">
    
    <!-- 🔄 LOADING -->
    <div v-if="dashboard.loading" class="loader">
      Cargando dashboard...
    </div>

    <div v-else>
      <h2 class="header my-5 text-3xl">📊 Dashboard POS</h2>

      <!-- 🧪 DEBUG (puedes quitar luego) -->
      <!-- <pre class="debug">{{ dashboard }}</pre> -->

      <!-- 🔹 STATS PRINCIPALES -->
      <div class="stats">
        <div v-for="(s, i) in dashboard.stats" :key="i" class="card">
          <p class="value">{{ formatNumber(s.value) }}</p>
          <p class="label">{{ s.label }}</p>
        </div>
      </div>

      <!-- 🔥 MÉTRICAS -->
      <h3 class="chart-title my-5 text-3xl ">📊 Métricas</h3>

      <div class="stats grid-3">
        <div v-for="(c, i) in extraCards" :key="i" class="card small">
          <p class="value">{{ formatNumber(c.value) }}</p>
          <p class="label">{{ c.label }}</p>
        </div>
      </div>

      <!-- 🔹 GOLD CHART -->
      <h3 class="chart-title my-5 text-3xl">Precio del Oro</h3>
      <div class="chart-box">
        <Line
          :key="JSON.stringify(goldChartData)"
          :data="goldChartData"
          :options="chartOptions"
        />
      </div>

      <!-- 🔹 USERS CHART -->
      <h3 class="chart-title my-5 text-3xl">Usuarios</h3>
      <div class="chart-box">
        <Bar
          :key="JSON.stringify(usersChartData)"
          :data="usersChartData"
          :options="chartOptions"
        />
      </div>

      <!-- 🔹 CAJA -->
      <div class="caja">
        <h3>💰 Caja</h3>
        <p>Apertura: {{ dashboard.caja?.apertura }}</p>
        <p>Cierre: {{ dashboard.caja?.cierre }}</p>
        <p>Saldo Inicial: S/ {{ formatNumber(dashboard.caja?.saldo_inicial) }}</p>
        <p>Saldo Actual: S/ {{ formatNumber(dashboard.caja?.saldo_actual) }}</p>
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
   FORMAT
========================= */
const formatNumber = (value) => {
  if (value === null || value === undefined) return 0
  return Number(value).toLocaleString()
}

/* =========================
   CHARTS
========================= */

// GOLD
const goldChartData = computed(() => ({
  labels: dashboard.charts?.gold?.labels || [],
  datasets: [
    {
      label: 'Oro',
      data: (dashboard.charts?.gold?.data || []).map(v => v || 0.01),
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
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

/* =========================
   MÉTRICAS
========================= */
const extraCards = computed(() => {
  const stats = dashboard.stats || []
  const caja = dashboard.caja || {}
  const chart = dashboard.charts?.gold?.data || []

  const usuarios = stats.find(s => s.label === 'Usuarios')?.value || 0
  const transacciones = stats.find(s => s.label === 'Transacciones')?.value || 0
  const volumen = stats.find(s => s.label === 'Volumen')?.value || 0

  const promedio = transacciones ? volumen / transacciones : 0

  const max = chart.length ? Math.max(...chart) : 0
  const min = chart.length ? Math.min(...chart) : 0
  const ultimo = chart.length ? chart[chart.length - 1] : 0

  return [
    { label: 'Usuarios', value: usuarios },
    { label: 'Transacciones', value: transacciones },
    { label: 'Volumen', value: volumen },
    { label: 'Promedio', value: promedio.toFixed(2) },
    { label: 'Máximo', value: max },
    { label: 'Mínimo', value: min },
    { label: 'Último', value: ultimo },
    { label: 'Registros', value: chart.length },
    { label: 'Caja Actual', value: caja.saldo_actual || 0 },
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
}

/* DEBUG */
.debug {
  background: black;
  color: lime;
  font-size: 10px;
  padding: 10px;
  margin-bottom: 10px;
  max-height: 150px;
  overflow: auto;
}

/* STATS */
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  flex: 1 1 45%;
  background: rgba(255,255,255,0.05);
  border: 1px solid #FFD700;
  border-radius: 12px;
  padding: 10px;
}

.card.small {
  flex: 1 1 30%;
  text-align: center;
}

.value {
  font-size: 16px;
  font-weight: bold;
}

.label {
  font-size: 12px;
  color: #aaa;
}

/* GRID */
.grid-3 {
  display: flex;
  flex-wrap: wrap;
}

/* CHART */
.chart-box {
  height: 300px;
  margin-bottom: 20px;
}

/* CAJA */
.caja {
  background: white;
  color: black;
  padding: 15px;
  border-radius: 12px;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .card {
    flex: 1 1 100%;
  }
}
</style>