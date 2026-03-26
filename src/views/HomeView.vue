<template>
  <div class="dashboard">
    
    <!-- 🔄 LOADING -->
    <div v-if="dashboard.loading" class="loader">
      Cargando dashboard...
    </div>

    <div v-else>
      <h2 class="header">📊 Dashboard POS</h2>

      <!-- 🔹 STATS -->
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
import { useDashboardStore } from '@/stores/dashboard'

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

// 📊 GOLD
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

// 📊 USERS
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

.value {
  font-weight: bold;
  font-size: 16px;
}

.label {
  font-size: 12px;
  color: #aaa;
}

/* CHARTS */
.chart-title {
  margin: 10px 0;
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
</style>