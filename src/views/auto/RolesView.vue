<script setup>
import { ref, onMounted } from 'vue'
import { useRolesStore } from '../../stores/useRolesStore'

const store = useRolesStore()
const newRole = ref('')

onMounted(() => {
  store.fetchRoles()
})

const addRole = async () => {
  if (!newRole.value) return
  await store.createRole(newRole.value)
  newRole.value = ''
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">👥 Roles</h1>

    <div class="flex gap-2 mb-4">
      <input v-model="newRole" placeholder="Nuevo rol"
        class="border rounded px-2 py-1 w-64" />
      <button @click="addRole"
        class="bg-green-500 text-white px-3 py-1 rounded">
        Agregar
      </button>
    </div>

    <ul class="space-y-2">
      <li v-for="role in store.roles" :key="role.id"
          class="flex justify-between items-center border p-2 rounded">
        <span>{{ role.name }}</span>
        <button @click="store.deleteRole(role.id)"
                class="bg-red-500 text-white px-2 py-1 rounded">
          Eliminar
        </button>
      </li>
    </ul>
  </div>
</template>
