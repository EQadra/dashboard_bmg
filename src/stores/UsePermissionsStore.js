import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios, setupAxios } from '../plugins/axios'

let api

// 🧩 Inicializa Axios de forma segura (por si el plugin aún no fue cargado)
try {
  api = useAxios()
} catch {
  console.warn('⚠️ Axios no inicializado. Configurando automáticamente desde el store...')
  api = setupAxios()
}

/** 🔒 Obtener cookie CSRF desde Laravel Sanctum */
async function getCsrfToken() {
  try {
    await api.get('/sanctum/csrf-cookie') // genera la cookie XSRF-TOKEN
    console.log('✅ CSRF cookie obtenida correctamente')
  } catch (error) {
    console.error('❌ Error al obtener CSRF cookie:', error)
  }
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
      const res = await api.get('/api/permisos')
      permissions.value = normalize(res)
      console.log('✅ Permisos cargados:', permissions.value)
      return permissions.value
    } catch (err) {
      console.error('❌ Error al cargar permisos:', err)
      error.value = 'Error al cargar permisos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (name) => {
    loading.value = true
    try {
      await getCsrfToken()
      const res = await api.post('/api/permisos', { name })
      const created = normalize(res)
      if (created && created.id) permissions.value.push(created)
      console.log('✅ Permiso creado:', created)
      return created
    } catch (err) {
      console.error('❌ Error al crear permiso:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id) => {
    loading.value = true
    try {
      await getCsrfToken()
      await api.delete(`/api/permisos/${id}`)
      permissions.value = permissions.value.filter((p) => p.id !== id)
      console.log('✅ Permiso eliminado:', id)
      return true
    } catch (err) {
      console.error('❌ Error al eliminar permiso:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ======= ROLES Y ASIGNACIÓN DE PERMISOS =======

  /** ✅ Obtener roles con sus permisos */
  const fetchRolesWithPermissions = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/roles-permissions')
      roles.value = normalize(res)
      console.log('✅ Roles y permisos cargados:', roles.value)
      return roles.value
    } catch (err) {
      console.error('❌ Error al cargar roles:', err)
      error.value = 'Error al cargar roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** ✅ Obtener permisos de un rol específico */
  const fetchRolePermissions = async (roleId) => {
    loading.value = true
    try {
      const res = await api.get(`/api/roles/${roleId}/permissions`)
      return normalize(res)
    } catch (err) {
      console.error('❌ Error al cargar permisos del rol:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /** ✅ Actualizar los permisos asignados a un rol */
  const updateRolePermissions = async (roleId, permissionsList) => {
    loading.value = true
    try {
      await getCsrfToken()
      const res = await api.put(`/api/roles/${roleId}/permissions`, {
        permissions: permissionsList,
      })
      const updated = normalize(res)

      // 🔄 Actualiza el rol en memoria
      const idx = roles.value.findIndex((r) => r.id === roleId)
      if (idx !== -1) roles.value[idx].permissions = updated

      console.log(`✅ Permisos del rol ${roleId} actualizados:`, updated)
      return updated
    } catch (err) {
      console.error('❌ Error al actualizar permisos del rol:', err)
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
    updateRolePermissions,
  }
})
