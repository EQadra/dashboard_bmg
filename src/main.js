// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// ✅ Importa el componente y sus estilos
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

// ✅ Axios config (🔥 antes de crear la app)
import { setupAxios } from './plugins/axios'

// 🟢 Inicializa Axios primero
setupAxios()

// Luego crea la app
const app = createApp(App)

app.use(createPinia())
app.use(router)

// ✅ Registra globalmente el componente de tabla
app.component('EasyDataTable', EasyDataTable)

// Monta la app
app.mount('#app')
