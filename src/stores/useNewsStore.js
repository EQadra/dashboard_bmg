import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCsrfToken } from '../utils/csrf'
import { useAxios } from '../plugins/axios'

export const useNewsStore = defineStore('news', () => {
  const news = ref([])

  const parseData = (res) => res?.data?.data ?? res?.data ?? []

  // 📥 Obtener todas las noticias
  const fetchAll = async () => {
    try {
      const api = useAxios() // ✅ AQUÍ (correcto)
      const res = await api.get('/api/noticias')
      news.value = parseData(res)
    } catch (error) {
      console.error(
        '❌ Error al obtener noticias:',
        error.response?.data || error
      )
    }
  }

  // ➕ Crear noticia
  const create = async (payload) => {
    try {
      const api = useAxios() // ✅ AQUÍ
      await getCsrfToken()
      const res = await api.post('/api/noticias', payload)
      news.value.unshift(parseData(res))
    } catch (error) {
      console.error('❌ Error al crear noticia:', error)
    }
  }

  // ✏️ Actualizar noticia
  const update = async (id, payload) => {
    try {
      const api = useAxios() // ✅ AQUÍ
      await getCsrfToken()
      const res = await api.put(`/api/noticias/${id}`, payload)

      const index = news.value.findIndex(n => n.id === id)
      if (index !== -1) {
        news.value[index] = parseData(res)
      }
    } catch (error) {
      console.error('❌ Error al actualizar noticia:', error)
    }
  }

  // 🗑️ Eliminar noticia
  const remove = async (id) => {
    try {
      const api = useAxios() // ✅ AQUÍ
      await getCsrfToken()
      await api.delete(`/api/noticias/${id}`)
      news.value = news.value.filter(n => n.id !== id)
    } catch (error) {
      console.error('❌ Error al eliminar noticia:', error)
    }
  }

  return {
    news,
    fetchAll,
    create,
    update,
    remove,
  }
})
