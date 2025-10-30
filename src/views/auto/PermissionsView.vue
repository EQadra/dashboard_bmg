<!-- views/Permissions.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-gray-900">Gestión de Permisos</h1>

    <!-- Crear permiso -->
    <div class="flex flex-wrap gap-2 mb-6">
      <input
        v-model.trim="newPermission"
        placeholder="Nuevo permiso"
        class="border rounded px-3 py-2 w-full md:w-1/3 text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
      />
      <button
        @click="addPermission"
        :disabled="!newPermission || store.loading"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {{ store.loading ? 'Guardando...' : 'Agregar' }}
      </button>
    </div>

    <!-- Tabla de permisos -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm border border-gray-200">
        <thead class="bg-gray-100 text-gray-800">
          <tr>
            <th class="px-4 py-2 border text-left">ID</th>
            <th class="px-4 py-2 border text-left">Nombre</th>
            <th class="px-4 py-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="perm in store.permissions"
            :key="perm.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-2 border">{{ perm.id }}</td>
            <td class="px-4 py-2 border">{{ perm.name }}</td>
            <td class="px-4 py-2 border text-center">
              <button
                @click="deletePermission(perm.id)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="!store.permissions.length && !store.loading">
            <td colspan="3" class="text-center py-4 text-gray-500">
              No hay permisos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Logs -->
    <div class="mt-6 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2 text-gray-900">Logs</h2>
      <pre
        class="text-xs text-gray-800 bg-gray-200 p-2 rounded max-h-60 overflow-y-auto"
      >{{ logs }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePermissionsStore } from '../../stores/usePermissionsStore'

const store = usePermissionsStore()
const newPermission = ref('')
const logs = ref('🔄 Cargando permisos...')

onMounted(async () => {
  try {
    await store.fetchPermissions()
    logs.value = '✅ Permisos cargados correctamente.'
  } catch (err) {
    logs.value = '❌ Error al cargar permisos: ' + (err.message || err)
  }
})

const addPermission = async () => {
  if (!newPermission.value) {
    logs.value = '⚠️ Ingresa un nombre de permiso.'
    return
  }

  try {
    logs.value = '🔄 Creando permiso...'
    await store.createPermission(newPermission.value)
    newPermission.value = ''
    logs.value = '✅ Permiso creado correctamente.'
  } catch (err) {
    logs.value = '❌ Error al crear permiso: ' + (err.response?.data?.message || err.message)
  }
}

const deletePermission = async (id) => {
  if (!confirm(`¿Eliminar el permiso con ID ${id}?`)) return

  try {
    logs.value = `🔄 Eliminando permiso con ID ${id}...`
    await store.deletePermission(id)
    logs.value = '✅ Permiso eliminado correctamente.'
  } catch (err) {
    logs.value = '❌ Error eliminando permiso: ' + (err.response?.data?.message || err.message)
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
