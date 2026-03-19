// stores/useUsersStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios } from '../plugins/axios.js'
import { getCsrfToken } from '../utils/csrf'

export const useUsersStore = defineStore('users', () => {
  const api = useAxios()

  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const normalize = (res) => res?.data?.data ?? res?.data ?? []

  /** 🔐 Verifica sesión automáticamente */
const checkAuth = async () => {
  try {
    await api.get('/api/profile') 
    return true
  } catch {
    return false
  }
}
  /** Obtener todos los usuarios */
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const isAuth = await checkAuth()

      if (!isAuth) {
        throw new Error('No autenticado')
      }

      const res = await api.get('/api/usuarios')
      users.value = normalize(res)

    } catch (err) {
      console.error('❌ Error al obtener usuarios:', err)

      if (err.response?.status === 401) {
        error.value = 'Sesión expirada o no autenticado'
      } else {
        error.value = 'Error al obtener usuarios'
      }

    } finally {
      loading.value = false
    }
  }

  /** Crear usuario */
  const createUser = async (payload) => {
    await getCsrfToken()

    try {
      const res = await api.post('/api/usuarios', payload)
      const created = res.data?.data ?? res.data
      const user = created?.user ?? created

      if (user) users.value.push(user)

      return user

    } catch (err) {
      console.error('❌ Error creando usuario:', err.response?.data || err)
      throw err
    }
  }

  /** Eliminar usuario */
  const deleteUser = async (id) => {
    await getCsrfToken()

    try {
      await api.delete(`/api/usuarios/${id}`)
      users.value = users.value.filter((u) => u.id !== id)
      return true

    } catch (err) {
      console.error('❌ Error eliminando usuario:', err)
      throw err
    }
  }

  /** Asignar rol */
  const assignRole = async (userId, roleId) => {
    await getCsrfToken()

    try {
      const res = await api.post(`/api/usuarios/${userId}/rol`, {
        role_id: roleId
      })

      const updated = res.data?.data ?? res.data
      const user = users.value.find((u) => u.id === userId)

      if (user) {
        user.roles =
          updated?.roles ??
          (updated?.role ? [updated.role] : [{ id: roleId }])
      }

      return updated

    } catch (err) {
      console.error('❌ Error al asignar rol:', err)
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
    assignRole,
  }
})