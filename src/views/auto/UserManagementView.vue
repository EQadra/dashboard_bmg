<template>
  <div class="p-6 bg-gray-900 min-h-screen">

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-blue-400">
        Gestión de Usuarios
      </h1>

      <button
        @click="showModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Nuevo Usuario
      </button>
    </div>

    <!-- TABLA -->
    <div class="overflow-x-auto bg-gray-800 rounded-lg shadow">
      <table class="w-full border border-gray-700 text-sm text-blue-300">
        <thead class="bg-gray-900">
          <tr>
            <th class="px-4 py-2 border border-gray-700 text-left">ID</th>
            <th class="px-4 py-2 border border-gray-700 text-left">Nombre</th>
            <th class="px-4 py-2 border border-gray-700 text-left">Email</th>
            <th class="px-4 py-2 border border-gray-700 text-left">Rol</th>
            <th class="px-4 py-2 border border-gray-700 text-left">Empresa</th>
            <th class="px-4 py-2 border border-gray-700 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in usersStore.users"
            :key="user.id"
            class="hover:bg-gray-700"
          >
            <td class="px-4 py-2 border border-gray-700">{{ user.id }}</td>
            <td class="px-4 py-2 border border-gray-700">{{ user.name }}</td>
            <td class="px-4 py-2 border border-gray-700">{{ user.email }}</td>

            <td class="px-4 py-2 border border-gray-700">
              {{ user.roles?.[0]?.name || "Sin rol" }}
            </td>

            <td class="px-4 py-2 border border-gray-700">
              {{ user.company?.name || "Sin empresa" }}
            </td>

            <td class="px-4 py-2 border border-gray-700 text-center">
              <button
                @click="deleteUser(user.id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </td>
          </tr>

          <tr v-if="!usersStore.users.length">
            <td colspan="6" class="text-center py-4 text-gray-400">
              No hay usuarios
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">

        <h2 class="text-xl text-blue-300 mb-4">
          Crear Usuario
        </h2>

        <form @submit.prevent="createUser" class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            v-model="newUser.name"
            placeholder="Nombre"
            class="px-3 py-2 bg-gray-900 border border-gray-700 text-blue-200 rounded"
          />

          <input
            v-model="newUser.email"
            type="email"
            placeholder="Email"
            class="px-3 py-2 bg-gray-900 border border-gray-700 text-blue-200 rounded"
          />

          <input
            v-model="newUser.password"
            type="password"
            placeholder="Contraseña"
            class="px-3 py-2 bg-gray-900 border border-gray-700 text-blue-200 rounded"
          />

          <!-- EMPRESA -->
          <select
            v-model="newUser.company_id"
            class="px-3 py-2 bg-gray-900 border border-gray-700 text-blue-200 rounded"
          >
            <option disabled value="">Seleccionar empresa</option>
            <option
              v-for="company in companyStore.companies"
              :key="company.id"
              :value="company.id"
            >
              {{ company.name }}
            </option>
          </select>

          <!-- 🔥 FIX REAL DEL ROL -->
          <select
            v-model="newUser.role_name"
            class="px-3 py-2 bg-gray-900 border border-gray-700 text-blue-200 rounded"
          >
            <option disabled value="">Seleccionar rol</option>
            <option
              v-for="role in rolesStore.roles"
              :key="role.id"
              :value="role.name"
            >
              {{ role.name }}
            </option>
          </select>

          <!-- BOTONES -->
          <div class="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>


import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

import { useUsersStore } from "@/stores/useUsersStore";
import { useRolesStore } from "@/stores/useRolesStore";
import { useCompanyStore } from "@/stores/useCompanyStore";

const usersStore = useUsersStore();
const rolesStore = useRolesStore();
const companyStore = useCompanyStore();

const showModal = ref(false);

const newUser = ref({
  name: "",
  email: "",
  password: "",
  role_name: "",
  company_id: "",
});

onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers(),
    rolesStore.fetchRoles(),
    companyStore.fetchCompanies(),
  ]);
});

/* =========================
   CREAR USUARIO
========================= */
const createUser = async () => {
  try {

    if (
      !newUser.value.name ||
      !newUser.value.email ||
      !newUser.value.password ||
      !newUser.value.company_id ||
      !newUser.value.role_name
    ) {
      return Swal.fire("Error", "Completa todos los campos", "error");
    }

    await usersStore.createUser({
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      company_id: newUser.value.company_id,
      roles: [newUser.value.role_name], // 🔥 CLAVE
    });

    Swal.fire("Éxito", "Usuario creado correctamente", "success");

    showModal.value = false;

    newUser.value = {
      name: "",
      email: "",
      password: "",
      role_name: "",
      company_id: "",
    };

  } catch (err) {
    Swal.fire("Error", err.response?.data?.message || err.message, "error");
  }
};

/* =========================
   ELIMINAR USUARIO
========================= */
const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: "¿Eliminar usuario?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    await usersStore.deleteUser(id);
    Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
  } catch (err) {
    Swal.fire("Error", "No se pudo eliminar", "error");
  }
};
</script>