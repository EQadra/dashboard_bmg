<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
    <div class="bg-white shadow-xl rounded-2xl p-10 max-w-md">
      <h1 class="text-4xl font-bold text-gray-700 mb-4">❌ 404</h1>
      <p class="text-gray-600 mb-6">
        La página que buscas no existe o fue movida.
      </p>
      <router-link
        to="/dashboard"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
      >
        ⬅️ Volver al inicio
      </router-link>
    </div>
  </div>
</template>
