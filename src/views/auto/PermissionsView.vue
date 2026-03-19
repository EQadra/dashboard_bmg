<!-- views/Permissions.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-100">
      Gestión de Permisos
    </h1>

    <!-- Crear permiso (sin cambios) -->
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
                @click="deletePermission(perm.id, perm.name)"
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
import Swal from 'sweetalert2'

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

// Crear permiso (sin cambios)
 const addPermission = async () => {
  if (!newPermission.value) return

  try {
    logs.value = `🔄 Creando permiso "${newPermission.value}"...`

    const created = await store.createPermission(newPermission.value)

    logs.value = `✅ Permiso "${created?.name || newPermission.value}" creado correctamente.`

    newPermission.value = ''

    Swal.fire({
      title: 'Permiso creado',
      text: `El permiso "${created?.name || ''}" fue agregado.`,
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 2000
    })
  } catch (err) {
    console.error(err)

    const msg = err.response?.data?.message || err.message || 'Error desconocido'

    logs.value = `❌ Error al crear permiso: ${msg}`

    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      confirmButtonColor: '#ef4444'
    })
  }
}
// ELIMINAR CON SWEETALERT2
const deletePermission = async (id, name) => {
  const result = await Swal.fire({
    title: '¿Eliminar este permiso?',
    html: `Estás a punto de eliminar el permiso <strong>"${name}"</strong> (ID: ${id}).<br><br>
           <span class="text-red-600 font-medium">Esta acción no se puede deshacer.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',      // rojo para eliminar
    cancelButtonColor: '#6b7280',       // gris para cancelar
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,               // botón de confirmar a la derecha
    focusCancel: true,                  // enfoca en cancelar por seguridad
    customClass: {
      popup: 'dark:bg-gray-800 dark:text-gray-200',  // adapta al dark mode si quieres
      title: 'text-xl font-bold',
      htmlContainer: 'text-gray-700 dark:text-gray-300',
      confirmButton: 'px-6 py-2 text-base',
      cancelButton: 'px-6 py-2 text-base'
    }
  })

  if (!result.isConfirmed) {
    logs.value = `❕ Eliminación cancelada para "${name}"`
    return
  }

  try {
    logs.value = `🔄 Eliminando permiso "${name}" (ID ${id})...`
    await store.deletePermission(id)
    logs.value = `✅ Permiso "${name}" eliminado correctamente.`
    
    // Opcional: Mostrar éxito con SweetAlert
    Swal.fire({
      title: 'Eliminado!',
      text: `El permiso "${name}" ha sido eliminado.`,
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 2000
    })
  } catch (err) {
    console.error('Error al eliminar:', err)
    const msg = err.response?.data?.message || err.message || 'Error desconocido'
    logs.value = `❌ Error al eliminar "${name}": ${msg}`
    
    // Mostrar error con SweetAlert
    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      confirmButtonColor: '#ef4444'
    })
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>