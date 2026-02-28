<!-- views/Permissions.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-100">
      Gestión de Permisos
    </h1>

    <!-- Crear permiso -->
    <div class="flex flex-wrap gap-2 mb-6">
      <input
        v-model.trim="newPermission"
        placeholder="Nuevo permiso"
        class="border rounded px-3 py-2 w-full md:w-1/3 
               bg-gray-800 text-gray-200 border-gray-600 
               placeholder-gray-500
               focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none
               dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
      />
      <button
        @click="addPermission"
        :disabled="!newPermission || store.loading"
        class="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors disabled:opacity-50
               dark:bg-cyan-700 dark:hover:bg-cyan-600"
      >
        {{ store.loading ? 'Guardando...' : 'Agregar' }}
      </button>
    </div>

    <!-- Tabla de permisos -->
    <div class="bg-gray-800/90 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
      <table class="w-full text-sm border border-gray-700 text-gray-200 divide-y divide-gray-700">
        <thead class="bg-gray-900/90 text-gray-300">
          <tr>
            <th class="px-6 py-3 border-b border-gray-700 text-left font-medium">ID</th>
            <th class="px-6 py-3 border-b border-gray-700 text-left font-medium">Nombre</th>
            <th class="px-6 py-3 border-b border-gray-700 text-center font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr
            v-for="perm in store.permissions"
            :key="perm.id"
            class="hover:bg-gray-700/60 transition-colors"
          >
            <td class="px-6 py-4 border-b border-gray-700">{{ perm.id }}</td>
            <td class="px-6 py-4 border-b border-gray-700">{{ perm.name }}</td>
            <td class="px-6 py-4 border-b border-gray-700 text-center">
              <button
                @click="deletePermission(perm.id)"
                class="bg-red-600/90 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition text-sm"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="!store.permissions.length && !store.loading">
            <td colspan="3" class="text-center py-6 text-gray-400">
              No hay permisos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Logs -->
    <div class="mt-8 bg-gray-900/60 p-5 rounded-xl border border-gray-700">
      <h2 class="text-lg font-semibold mb-3 text-gray-200">Logs</h2>
      <pre
        class="text-sm text-gray-300 bg-gray-950/50 p-4 rounded-lg max-h-60 overflow-y-auto font-mono border border-gray-800"
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

// ... el resto de tus funciones (addPermission, deletePermission) sin cambios ...
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>