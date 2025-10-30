import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { getCsrfToken } from '../utils/csrf'

export const useNewsStore = defineStore('news', () => {
  const news = ref([])

  // ✅ Obtener todas las noticias
  async function fetchAll() {
    try {
      const res = await axios.get('/api/noticias')
      news.value = res.data.data ?? res.data
    } catch (error) {
      console.error('Error al obtener noticias:', error)
    }
  }

  // ✅ Crear una noticia
  async function create(payload) {
    try {
      await getCsrfToken()
      const res = await axios.post('/api/noticias', payload)
      news.value.unshift(res.data.data ?? res.data)
    } catch (error) {
      console.error('Error al crear noticia:', error)
    }
  }

  // ✅ Actualizar una noticia
  async function update(id, payload) {
    try {
      await getCsrfToken()
      const res = await axios.put(`/api/noticias/${id}`, payload)
      const index = news.value.findIndex(n => n.id === id)
      if (index !== -1) {
        news.value[index] = res.data.data ?? res.data
      }
    } catch (error) {
      console.error('Error al actualizar noticia:', error)
    }
  }

  // ✅ Eliminar una noticia
  async function remove(id) {
    try {
      await getCsrfToken()
      await axios.delete(`/api/noticias/${id}`)
      news.value = news.value.filter(n => n.id !== id)
    } catch (error) {
      console.error('Error al eliminar noticia:', error)
    }
  }

  return {
    news,
    fetchAll,
    create,
    update,
    remove
  }
})
