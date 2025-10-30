<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        <ShieldCheck class="w-6 h-6" /> Verificar cuenta
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <input v-model="email" type="email" placeholder="Correo electrónico"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <input v-model="code" type="text" placeholder="Código de verificación"
               class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required />
        <button type="submit"
                class="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition">
          Verificar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/useAuthStore'
import { ShieldCheck } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const store = useAuthStore()
const router = useRouter()
const email = ref('')
const code = ref('')

const onSubmit = async () => {
  try {
    await store.verifyAccount(email.value, code.value)
    Swal.fire({
      icon: 'success',
      title: 'Cuenta verificada',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      router.push('/dashboard')
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
