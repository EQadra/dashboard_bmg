<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRolesStore } from '../../stores/useRolesStore'
import { usePermissionsStore } from '../../stores/usePermissionsStore'

const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()

const selectedRole = ref(null)
const rolePermissions = ref([])
const loadingPermissions = ref(false)
const logs = ref('🔄 Cargando roles...')

// 📦 Cargar roles y permisos globales
onMounted(async () => {
  try {
    await Promise.all([
      rolesStore.fetchRoles(),
      permissionsStore.fetchPermissions(),
    ])
    logs.value = '✅ Roles y permisos cargados correctamente.'
  } catch (err) {
    logs.value = '❌ Error al cargar datos: ' + (err.message || err)
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar datos',
      text: err.message || 'No se pudieron cargar roles y permisos.',
    })
  }
})

// 📜 Cargar permisos de un rol
const loadRolePermissions = async (role) => {
  selectedRole.value = role
  loadingPermissions.value = true
  logs.value = `🔄 Cargando permisos de "${role.name}"...`
  try {
    rolePermissions.value = await rolesStore.fetchRolePermissions(role.id)
    logs.value = `✅ Permisos cargados para "${role.name}"`
    Swal.fire({
      icon: 'info',
      title: 'Permisos cargados',
      text: `Se cargaron los permisos de "${role.name}".`,
      timer: 1200,
      showConfirmButton: false,
    })
  } catch (err) {
    logs.value = `❌ Error al cargar permisos: ${err.message || err}`
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar permisos',
      text: err.message || 'No se pudieron obtener los permisos del rol.',
    })
    rolePermissions.value = []
  } finally {
    loadingPermissions.value = false
  }
}

// 🔘 Asignar o revocar permiso con confirmación y alertas
const togglePermission = async (permissionName) => {
  if (!selectedRole.value) return

  const hasPermission = rolePermissions.value.includes(permissionName)
  const action = hasPermission ? 'revocar' : 'asignar'
  const confirmColor = hasPermission ? '#dc2626' : '#16a34a'
  const confirmText = hasPermission ? 'Sí, revocar' : 'Sí, asignar'

  const result = await Swal.fire({
    title: `${hasPermission ? 'Revocar' : 'Asignar'} permiso`,
    text: `¿Seguro que deseas ${action} el permiso "${permissionName}" al rol "${selectedRole.value.name}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#6b7280',
  })

  if (!result.isConfirmed) return

  loadingPermissions.value = true
  try {
    if (hasPermission) {
      await rolesStore.revokePermission(selectedRole.value.id, permissionName)
      rolePermissions.value = rolePermissions.value.filter((p) => p !== permissionName)
      Swal.fire({
        icon: 'success',
        title: 'Permiso revocado',
        text: `"${permissionName}" fue eliminado de "${selectedRole.value.name}".`,
        timer: 1500,
        showConfirmButton: false,
      })
      logs.value = `🚫 Permiso "${permissionName}" revocado de "${selectedRole.value.name}"`
    } else {
      await rolesStore.assignPermission(selectedRole.value.id, permissionName)
      rolePermissions.value.push(permissionName)
      Swal.fire({
        icon: 'success',
        title: 'Permiso asignado',
        text: `"${permissionName}" fue asignado a "${selectedRole.value.name}".`,
        timer: 1500,
        showConfirmButton: false,
      })
      logs.value = `✅ Permiso "${permissionName}" asignado a "${selectedRole.value.name}"`
    }
  } catch (err) {
    logs.value = `❌ Error al modificar permiso: ${err.response?.data?.message || err.message}`
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo actualizar el permiso.',
    })
  } finally {
    loadingPermissions.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 🔑 Encabezado -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Permisos por Rol</h1>
      <p class="text-gray-500 text-sm">Selecciona un rol y activa o desactiva sus permisos.</p>
    </div>

    <!-- 🧩 Lista de roles -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="role in rolesStore.roles"
        :key="role.id"
        @click="loadRolePermissions(role)"
        class="px-4 py-2 rounded-lg transition text-sm font-medium"
        :class="selectedRole?.id === role.id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'"
      >
        {{ role.name }}
      </button>
    </div>

    <!-- 🧱 Permisos del rol -->
    <div v-if="selectedRole" class="mt-6">
      <h2 class="text-xl font-semibold mb-4">
        Permisos de: <span class="text-blue-600">{{ selectedRole.name }}</span>
      </h2>

      <div v-if="loadingPermissions" class="text-gray-500 py-2 animate-pulse">
        🔄 Cargando permisos...
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <div
          v-for="perm in permissionsStore.permissions"
          :key="perm.id"
          class="flex items-center justify-between bg-white border rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition"
        >
          <span class="text-gray-800 text-sm">{{ perm.name }}</span>

          <!-- ✅ Toggle Switch -->
          <button
            @click="togglePermission(perm.name)"
            class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors"
            :class="rolePermissions.includes(perm.name)
              ? 'bg-green-500'
              : 'bg-gray-300 hover:bg-gray-400'"
          >
            <span
              class="inline-block h-5 w-5 transform bg-white rounded-full transition-transform shadow"
              :class="rolePermissions.includes(perm.name)
                ? 'translate-x-6'
                : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <div
          v-if="!permissionsStore.permissions.length"
          class="text-gray-500 col-span-full text-center py-4"
        >
          No hay permisos registrados.
        </div>
      </div>
    </div>

    <!-- 🧾 Logs -->
    <div class="bg-gray-100 p-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2 text-gray-900">Logs</h2>
      <pre
        class="text-xs bg-gray-200 text-gray-800 p-2 rounded max-h-60 overflow-y-auto whitespace-pre-wrap"
      >
{{ logs }}
      </pre>
    </div>
  </div>
</template>

<style scoped>
button[role="switch"] {
  transition: background-color 0.2s ease;
}
</style>
