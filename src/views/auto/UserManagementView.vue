<!-- views/UserManagement.vue -->
<template>
  <div class="p-6">
    <!-- Título principal -->
    <h1 class="text-2xl font-bold mb-6 text-gray-900">
      Gestión de Usuarios
    </h1>

    <!-- Tabla de usuarios -->
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full border border-gray-300 text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border text-left text-gray-900">ID</th>
            <th class="px-4 py-2 border text-left text-gray-900">Nombre</th>
            <th class="px-4 py-2 border text-left text-gray-900">Email</th>
            <th class="px-4 py-2 border text-left text-gray-900">Rol</th>
            <th class="px-4 py-2 border text-center text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in usersStore.users"
            :key="user.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-2 border text-gray-900">{{ user.id }}</td>
            <td class="px-4 py-2 border text-gray-900">{{ user.name }}</td>
            <td class="px-4 py-2 border text-gray-900">{{ user.email }}</td>
            <td class="px-4 py-2 border text-gray-900">
              {{ user.roles?.length ? user.roles[0].name : "Sin rol" }}
            </td>
            <td class="px-4 py-2 border text-center">
              <button
                @click="deleteUser(user.id)"
                class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="!usersStore.users.length">
            <td colspan="5" class="text-center py-4 text-gray-500">
              No hay usuarios registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulario de creación -->
    <div class="mt-6 bg-white p-4 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4 text-gray-900">Crear Usuario</h2>
      <form @submit.prevent="createUser" class="flex flex-wrap gap-4">
        <input
          v-model.trim="newUser.name"
          placeholder="Nombre"
          class="px-3 py-2 border rounded w-full md:w-1/3 text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <input
          v-model.trim="newUser.email"
          placeholder="Email"
          type="email"
          class="px-3 py-2 border rounded w-full md:w-1/3 text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <input
          v-model.trim="newUser.password"
          placeholder="Contraseña"
          type="password"
          class="px-3 py-2 border rounded w-full md:w-1/3 text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />
        <select
          v-model="newUser.role_id"
          class="px-3 py-2 border rounded w-full md:w-1/3 text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option disabled value="">Seleccionar rol</option>
          <option
            v-for="role in rolesStore.roles"
            :key="role.id"
            :value="role.id"
          >
            {{ role.name }}
          </option>
        </select>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Crear
        </button>
      </form>
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
import { ref, onMounted } from "vue";
import { useUsersStore } from "../../stores/useUsersStore";
import { useRolesStore } from "../../stores/useRolesStore";

const usersStore = useUsersStore();
const rolesStore = useRolesStore();

const logs = ref("Esperando acciones...");
const newUser = ref({
  name: "",
  email: "",
  password: "",
  role_id: "",
});

onMounted(async () => {
  logs.value = "🔄 Cargando usuarios y roles...";
  try {
    await Promise.all([usersStore.fetchUsers(), rolesStore.fetchRoles()]);
    logs.value = "✅ Usuarios y roles cargados correctamente.";
  } catch (err) {
    logs.value = "❌ Error cargando datos: " + (err.message || err);
  }
});

const createUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password || !newUser.value.role_id) {
    logs.value = "⚠️ Debes completar todos los campos antes de crear un usuario.";
    return;
  }

  try {
    logs.value = "🔄 Creando usuario...";

    // Convertir role_id → role.name para enviar lo que Laravel espera
    const role = rolesStore.roles.find(r => r.id === newUser.value.role_id);

    await usersStore.createUser({
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      roles: role ? [role.name] : [], // ✅ Laravel espera un array de nombres
    });

    logs.value = "✅ Usuario creado correctamente.";
    newUser.value = { name: "", email: "", password: "", role_id: "" };
  } catch (err) {
    logs.value = "❌ Error creando usuario: " + (err.response?.data?.message || err.message || err);
  }
};

const deleteUser = async (id) => {
  if (!confirm(`¿Eliminar usuario con ID ${id}?`)) return;

  try {
    logs.value = `🔄 Eliminando usuario con ID ${id}...`;
    await usersStore.deleteUser(id);
    logs.value = "✅ Usuario eliminado correctamente.";
  } catch (err) {
    logs.value = "❌ Error eliminando usuario: " + (err.message || err);
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
