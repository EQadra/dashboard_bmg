import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios } from '@/plugins/axios'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** 🔒 CSRF */
  const getCsrfToken = async () => {
    const api = useAxios()
    await api.get('/sanctum/csrf-cookie')
  }

  /** 📦 Obtener roles */
  const fetchRoles = async () => {
    loading.value = true
    error.value = null

    try {
      const api = useAxios()
      const res = await api.get('/api/roles')
      roles.value = res.data?.data ?? []
      return roles.value
    } catch (err) {
      console.error(err)
      error.value = 'Error al obtener roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** ➕ Crear rol */
  const createRole = async (name) => {
    await getCsrfToken()
    const api = useAxios()
    const res = await api.post('/api/roles', { name })
    const role = res.data?.data ?? res.data
    if (role) roles.value.push(role)
    return role
  }

  /** ✏️ Actualizar rol */
  const updateRole = async (id, name) => {
    await getCsrfToken()
    const api = useAxios()
    const res = await api.put(`/api/roles/${id}`, { name })
    const role = res.data?.data ?? res.data

    const index = roles.value.findIndex(r => r.id === id)
    if (index !== -1) roles.value[index] = role

    return role
  }

  /** 🗑️ Eliminar rol */
  const deleteRole = async (id) => {
    await getCsrfToken()
    const api = useAxios()
    await api.delete(`/api/roles/${id}`)
    roles.value = roles.value.filter(r => r.id !== id)
    return true
  }

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
})
