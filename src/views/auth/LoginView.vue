<!-- views/auth/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        <LogIn class="w-6 h-6" /> Iniciar sesión
      </h2>

      <!-- Formulario -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <input
          v-model.trim="email"
          type="email"
          placeholder="Correo electrónico"
          class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
          required
        />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Contraseña"
          class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
          required
        />

        <button
          type="submit"
          :disabled="store.loading"
          class="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="store.loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <!-- Enlaces -->
      <div class="mt-4 text-sm text-gray-500 flex justify-between">
        <RouterLink to="/register" class="text-blue-600 hover:underline">
          Registrarse
        </RouterLink>
        <RouterLink to="/forgot-password" class="text-blue-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import { LogIn } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";

const store = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

// Nueva versión de login basada en el store actualizado
const onSubmit = async () => {
  if (!email.value || !password.value) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor ingresa tu correo y contraseña.",
    });
    return;
  }

  try {
    // ✅ Llamamos al store y esperamos la respuesta
    const response = await store.login({
      email: email.value.trim(),
      password: password.value.trim(),
    });

    // ✅ Si llegó aquí, el login fue exitoso (porque el store lanza error si falla)
    Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: `Hola, ${response.user?.name || "usuario"}`,
      timer: 1500,
      showConfirmButton: false,
    });

    // ✅ Redirige al dashboard
    router.push("/dashboard");

  } catch (err) {
    // ✅ Si ocurre error, se captura aquí
    Swal.fire({
      icon: "error",
      title: "Error de autenticación",
      text: err.message || store.error || "No se pudo iniciar sesión. Intenta nuevamente.",
    });
  }
};

</script>
