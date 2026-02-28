// src/stores/usePermissionsStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios, setupAxios } from '../plugins/axios'
import { getCsrfToken } from '../utils/csrf'

let api
try {
  api = useAxios()
} catch {
  console.warn('⚠️ Axios no inicializado, configurando automáticamente...')
  api = setupAxios()
}

export const usePermissionsStore = defineStore('permissions', () => {
  // ======= ESTADOS =======
  const permissions = ref([])
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)

  /** 🧩 Normaliza respuesta del backend */
  const normalize = (res) => res?.data?.data ?? res?.data ?? []

  // ======= CRUD DE PERMISOS =======
  const fetchPermissions = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/api/permisos') // ruta CRUD permisos
      permissions.value = normalize(res)
      console.log('✅ Permisos cargados:', permissions.value)
      return permissions.value
    } catch (err) {
      console.error('❌ Error al cargar permisos:', err)
      error.value = err.response?.data?.message || 'Error al cargar permisos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (name) => {
    loading.value = true
    error.value = null
    try {
      await getCsrfToken()
      const res = await api.post('/api/permisos', { name })
      const created = normalize(res)
      if (created && created.id) permissions.value.push(created)
      console.log('✅ Permiso creado:', created)
      return created
    } catch (err) {
      console.error('❌ Error al crear permiso:', err)
      error.value = err.response?.data?.message || 'Error al crear permiso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id) => {
    loading.value = true
    error.value = null
    try {
      await getCsrfToken()
      await api.delete(`/api/permisos/${id}`)
      permissions.value = permissions.value.filter((p) => p.id !== id)
      console.log('✅ Permiso eliminado:', id)
      return true
    } catch (err) {
      console.error('❌ Error al eliminar permiso:', err)
      error.value = err.response?.data?.message || 'Error al eliminar permiso'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ======= ROLES Y PERMISOS =======
  const fetchRolesWithPermissions = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/api/roles') // Trae todos los roles
      roles.value = normalize(res)
      console.log('✅ Roles cargados:', roles.value)
      return roles.value
    } catch (err) {
      console.error('❌ Error al cargar roles:', err)
      error.value = err.response?.data?.message || 'Error al cargar roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRolePermissions = async (roleId) => {
    loading.value = true
    error.value = null
    try {
      // 🔹 Nota: Laravel espera /roles/{role}/permissions
      const res = await api.get(`/api/roles/${roleId}/permissions`)
      const perms = normalize(res)
      console.log(`✅ Permisos del rol ${roleId}:`, perms)
      return perms
    } catch (err) {
      console.error('❌ Error al cargar permisos del rol:', err)
      error.value = err.response?.data?.message || 'Error al cargar permisos del rol'
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignPermission = async (roleId, permissionName) => {
    try {
      await getCsrfToken()
      await api.post(`/api/roles/${roleId}/permissions/assign`, { permission: permissionName })
      console.log(`✅ Permiso ${permissionName} asignado al rol ${roleId}`)
    } catch (err) {
      console.error('❌ Error al asignar permiso:', err)
      throw err
    }
  }

  const revokePermission = async (roleId, permissionName) => {
    try {
      await getCsrfToken()
      await api.post(`/api/roles/${roleId}/permissions/revoke`, { permission: permissionName })
      console.log(`✅ Permiso ${permissionName} revocado del rol ${roleId}`)
    } catch (err) {
      console.error('❌ Error al revocar permiso:', err)
      throw err
    }
  }

  const updateRolePermissions = async (roleId, permissionsList) => {
    loading.value = true
    error.value = null
    try {
      await getCsrfToken()
      const res = await api.put(`/api/roles/${roleId}/permissions`, { permissions: permissionsList })
      const updated = normalize(res)

      const idx = roles.value.findIndex((r) => r.id === roleId)
      if (idx !== -1) roles.value[idx].permissions = updated

      console.log(`✅ Permisos del rol ${roleId} actualizados:`, updated)
      return updated
    } catch (err) {
      console.error('❌ Error al actualizar permisos del rol:', err)
      error.value = err.response?.data?.message || 'Error al actualizar permisos del rol'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    permissions,
    roles,
    loading,
    error,
    fetchPermissions,
    createPermission,
    deletePermission,
    fetchRolesWithPermissions,
    fetchRolePermissions,
    assignPermission,
    revokePermission,
    updateRolePermissions,
  }
})
