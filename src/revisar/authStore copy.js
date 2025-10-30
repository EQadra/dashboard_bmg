// stores/useAuthStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const setAuthHeader = () => ({
    Authorization: `Bearer ${token.value}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  })


  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const login = async (email, password) => {
    if (!validateEmail(email)) throw 'Correo inválido'
    if (!password || password.length < 6) throw 'Contraseña inválida'

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw await res.json()

      const data = await res.json()
      if (!data.access_token || !data.user) throw 'Respuesta inválida'

      token.value = data.access_token
      user.value = data.user
      localStorage.setItem('token', token.value)
      router.push('/dashboard')
    } catch (error) {
      throw typeof error === 'string' ? error : error.message || 'Error al iniciar sesión'
    }
  }

  const register = async (name, email, password) => {
    if (!name || name.length < 2) throw 'Nombre inválido'
    if (!validateEmail(email)) throw 'Correo inválido'
    if (!password || password.length < 6) throw 'La contraseña debe tener al menos 6 caracteres'

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) throw await res.json()

      router.push('/verify')
    } catch (error) {
      throw error.message || 'Error al registrarse'
    }
  }

  const verifyAccount = async (email, code) => {
    if (!validateEmail(email)) throw 'Correo inválido'
    if (!code || code.length !== 6) throw 'Código de verificación inválido'

    try {
      const res = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (!res.ok) throw await res.json()

      const data = await res.json()
      if (!data.access_token || !data.user) throw 'Respuesta inválida'

      token.value = data.access_token
      user.value = data.user
      localStorage.setItem('token', token.value)
      router.push('/dashboard')
    } catch (error) {
      throw error.message || 'Verificación fallida'
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const res = await fetch('/api/auth/profile', {
        headers: setAuthHeader(),
      })

      if (!res.ok) throw new Error('Token inválido')

      const data = await res.json()
      user.value = data.user
    } catch (error) {
      logout()
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: setAuthHeader(),
      })
    } catch (e) {
      // Ignorar error de red o token expirado
    }

    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    router.push('/login')
  }

  const sendResetLink = async (email) => {
    if (!validateEmail(email)) throw 'Correo inválido'

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw await res.json()
      return 'Enlace de recuperación enviado'
    } catch (error) {
      throw error.message || 'Error al enviar enlace'
    }
  }

  const resetPassword = async (payload) => {
    if (
      !payload.email ||
      !validateEmail(payload.email) ||
      !payload.token ||
      !payload.password ||
      payload.password.length < 6 ||
      payload.password !== payload.password_confirmation
    ) {
      throw 'Datos de recuperación inválidos'
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw await res.json()
      return 'Contraseña actualizada correctamente'
    } catch (error) {
      throw error.message || 'Error al restablecer contraseña'
    }
  }

  return {
    user,
    token,
    login,
    register,
    verifyAccount,
    logout,
    fetchUser,
    sendResetLink,
    resetPassword,
    setAuthHeader,
  }
})
