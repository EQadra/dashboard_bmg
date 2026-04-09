// src/plugins/axios.js
import axios from 'axios'

let api // instancia compartida global

export function setupAxios() {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://apierp.tudealer.app',
    withCredentials: true, // 🔥 Necesario para enviar/recibir cookies de Sanctum
    headers: {
      'X-Requested-With': 'XMLHttpRequest', // 🔥 Laravel requiere esto
    },
  })

  // Interceptor de respuesta para debug
  api.interceptors.response.use(
    res => res,
    err => {
      console.error(
        '❌ Axios error:',
        err.response?.data || err.message || 'Error desconocido'
      )
      return Promise.reject(err)
    }
  )

  // Interceptor de request (opcional, útil para ver si CSRF token se envía)
  api.interceptors.request.use(
    config => {
      const xsrf = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

      if (xsrf) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf)
      }
      return config
    },
    error => Promise.reject(error)
  )

  // 🔥 Exponer Axios globalmente (útil si usas librerías que dependen de axios)
  window.axios = api
  return api
}

// Para importar la instancia en otros módulos (ej: csrf.js o stores)
export function useAxios() {
  if (!api)
    throw new Error('Axios no inicializado. Llama a setupAxios() en main.js antes.')
  return api
}
