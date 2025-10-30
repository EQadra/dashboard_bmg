<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
      <button @click="$emit('close')" class="absolute top-2 right-3 text-xl font-bold">&times;</button>
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
