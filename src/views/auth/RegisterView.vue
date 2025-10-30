<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        <UserPlus class="w-6 h-6" /> Crear cuenta
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <input v-model="name" type="text" placeholder="Nombre completo"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <input v-model="email" type="email" placeholder="Correo electrónico"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <input v-model="password" type="password" placeholder="Contraseña"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <button type="submit"
                class="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition">
          Registrarse
        </button>
      </form>
      <p class="mt-4 text-sm text-gray-500">
        ¿Ya tienes cuenta? <RouterLink to="/login" class="text-blue-600 hover:underline">Inicia sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/useAuthStore'
import Swal from 'sweetalert2'

const store = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')

const onSubmit = async () => {
  try {
    await store.register(name.value, email.value, password.value)
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Revisa tu correo para verificar tu cuenta.'
    }).then(() => {
      router.push('/verify')
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err
    })
  }
}
</script>
