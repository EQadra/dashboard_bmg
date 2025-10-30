import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios, setupAxios } from '../plugins/axios'

let api
try {
  api = useAxios()
} catch {
  console.warn('⚠️ Axios no inicializado. Configurando automáticamente...')
  api = setupAxios()
}

/** 🔒 CSRF cookie de Sanctum */
async function getCsrfToken() {
  try {
    await api.get('/sanctum/csrf-cookie')
  } catch (error) {
    console.error('❌ Error al obtener CSRF cookie:', error)
  }
}

export const useRolesStore = defineStore('roles', () => {
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** 🔧 Normaliza respuestas */
  const extractArray = (res) => {
    const payload = res?.data
    if (!payload) return []
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.roles)) return payload.roles
    if (Array.isArray(payload)) return payload
    return []
  }

  /** 📦 Obtener todos los roles */
  const fetchRoles = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/roles')
      roles.value = extractArray(res)
      return roles.value
    } catch (err) {
      console.error('❌ Error al obtener roles:', err)
      error.value = 'Error al obtener roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** ➕ Crear nuevo rol */
  const createRole = async (name) => {
    try {
      await getCsrfToken()
      const res = await api.post('/api/roles', { name })
      const role = res.data?.data ?? res.data
      if (role) roles.value.push(role)
      return role
    } catch (err) {
      console.error('❌ Error al crear rol:', err)
      throw err
    }
  }

  /** ✏️ Actualizar rol */
  const updateRole = async (id, name) => {
    try {
      await getCsrfToken()
      const res = await api.put(`/api/roles/${id}`, { name })
      const role = res.data?.data ?? res.data
      const i = roles.value.findIndex(r => r.id === id)
      if (i !== -1) roles.value[i] = role
      return role
    } catch (err) {
      console.error('❌ Error al actualizar rol:', err)
      throw err
    }
  }

  /** 🗑️ Eliminar rol */
  const deleteRole = async (id) => {
    try {
      await getCsrfToken()
      await api.delete(`/api/roles/${id}`)
      roles.value = roles.value.filter(r => r.id !== id)
      return true
    } catch (err) {
      console.error('❌ Error al eliminar rol:', err)
      throw err
    }
  }

  /** 🔍 Obtener permisos de un rol */
  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await api.get(`/api/roles/${roleId}/permisos`)
      const permissions = res.data?.data ?? []
      console.log(`✅ Permisos del rol ${roleId}:`, permissions)

      // Sincroniza localmente
      const role = roles.value.find(r => r.id === roleId)
      if (role) role.permissions = permissions.map(p => ({ name: p }))

      return permissions
    } catch (err) {
      console.error('❌ Error al obtener permisos del rol:', err)
      throw err
    }
  }

  /** 🔗 Asignar permiso a un rol */
  const assignPermission = async (roleId, permissionName) => {
    try {
      await getCsrfToken()
      const res = await api.post(`/api/roles/${roleId}/permisos/asignar`, {
        permission: permissionName,
      })
      const updated = res.data?.data ?? []

      const role = roles.value.find(r => r.id === roleId)
      if (role) role.permissions = updated.map(p => ({ name: p }))

      console.log(`✅ Permiso "${permissionName}" asignado al rol ${roleId}`)
      return updated
    } catch (err) {
      console.error('❌ Error al asignar permiso:', err)
      throw err
    }
  }

  /** 🚫 Revocar permiso */
  const revokePermission = async (roleId, permissionName) => {
    try {
      await getCsrfToken()
      const res = await api.post(`/api/roles/${roleId}/permisos/revocar`, {
        permission: permissionName,
      })
      const updated = res.data?.data ?? []

      const role = roles.value.find(r => r.id === roleId)
      if (role) role.permissions = updated.map(p => ({ name: p }))

      console.log(`🔴 Permiso "${permissionName}" revocado del rol ${roleId}`)
      return updated
    } catch (err) {
      console.error('❌ Error al revocar permiso:', err)
      throw err
    }
  }

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    fetchRolePermissions, // ✅ corregido
    assignPermission,     // ✅ ahora sí coincide con backend
    revokePermission,     // ✅ también agregado
  }
})
