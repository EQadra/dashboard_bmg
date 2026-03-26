import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAxios } from '../plugins/axios'
import { getCsrfToken } from '../utils/csrf'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const api = useAxios()

  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const roles = ref(JSON.parse(localStorage.getItem('roles')) || [])
  const permisos = ref(JSON.parse(localStorage.getItem('permisos')) || [])
  const loading = ref(false)
  const error = ref(null)

  const saveUser = ({ user: u, roles: r = [], permisos: p = [] }) => {
    user.value = u
    roles.value = r
    permisos.value = p
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('roles', JSON.stringify(r))
    localStorage.setItem('permisos', JSON.stringify(p))
  }

  const clearUser = () => {
    user.value = null
    roles.value = []
    permisos.value = []
    localStorage.removeItem('user')
    localStorage.removeItem('roles')
    localStorage.removeItem('permisos')
  }

  const login = async ({ email, password }) => {
    loading.value = true
    error.value = null
    try {
      await getCsrfToken()
      const { data } = await api.post('/login', { email, password })
      saveUser(data)
      router.push('/dashboard')
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const register = async (payload) => {
    loading.value = true
    error.value = null
    try {
      await getCsrfToken()
      const { data } = await api.post('/register', payload)
      if (data?.user) {
        saveUser(data)
        router.push('/dashboard')
      } else {
        router.push('/verify-account')
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrarse'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/api/profile')
      saveUser(data)
    } catch (err) {
      clearUser()
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/logout')
    } catch {
      console.warn('⚠️ Error al cerrar sesión')
    } finally {
      clearUser()
      router.push('/login')
    }
  }

  return {
    user,
    roles,
    permisos,
    loading,
    error,
    login,
    register,
    fetchUser,
    logout,
  }
})
