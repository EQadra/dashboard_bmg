<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        <Mail class="w-6 h-6" /> Recuperar contraseña
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <input v-model="email" type="email" placeholder="Correo electrónico"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <button type="submit"
                class="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition">
          Enviar enlace
        </button>
      </form>
      <p class="mt-4 text-sm text-gray-500">
        ¿Recordaste tu contraseña? <RouterLink to="/login" class="text-blue-600 hover:underline">Inicia sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/useAuthStore'
import { Mail } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const store = useAuthStore()
const email = ref('')

const onSubmit = async () => {
  try {
    const msg = await store.sendResetLink(email.value)
    Swal.fire({
      icon: 'success',
      title: 'Enviado',
      text: msg
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err
    })
  }
}
</script>
