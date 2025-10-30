import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCsrfToken } from '../utils/csrf'
import { useAxios } from '../plugins/axios' // ✅ usa el mismo axios
const api = useAxios()

export const useNewsStore = defineStore('news', () => {
  const news = ref([])

  const parseData = (res) => res.data.data ?? res.data

  async function fetchAll() {
    try {
      const res = await api.get('/api/noticias') // ✅ no repitas /api
      news.value = parseData(res)
    } catch (error) {
      console.error('❌ Error al obtener noticias:', error.response?.data || error)
    }
  }

  async function create(payload) {
    try {
      await getCsrfToken()
      const res = await api.post('/api/noticias', payload)
      news.value.unshift(parseData(res))
    } catch (error) {
      console.error('Error al crear noticia:', error)
    }
  }

  async function update(id, payload) {
    try {
      await getCsrfToken()
      const res = await api.put(`/api/noticias/${id}`, payload)
      const index = news.value.findIndex(n => n.id === id)
      if (index !== -1) {
        news.value[index] = parseData(res)
      }
    } catch (error) {
      console.error('Error al actualizar noticia:', error)
    }
  }

  async function remove(id) {
    try {
      await getCsrfToken()
      await api.delete(`api/noticias/${id}`)
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
    remove,
  }
})
