<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        <Key class="w-6 h-6" /> Nueva contraseña
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <input v-model="email" type="email" placeholder="Correo electrónico"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <input v-model="password" type="password" placeholder="Nueva contraseña"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <input v-model="passwordConfirmation" type="password" placeholder="Confirmar contraseña"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <button type="submit"
                class="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition">
          Actualizar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore'
import { Key } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const store = useAuthStore()

const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

onMounted(() => {
  token.value = route.query.token || ''
  email.value = route.query.email || ''
})

const onSubmit = async () => {
  try {
    const msg = await store.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    Swal.fire({
      icon: 'success',
      title: 'Contraseña actualizada',
      text: msg
    }).then(() => {
      router.push('/login')
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
