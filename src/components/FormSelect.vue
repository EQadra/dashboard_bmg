<template>
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {{ label }}
      </label>
      <select
        v-model="modelValue"
        class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      >
        <option v-for="option in options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  defineProps({
    label: String,
    options: Array,
  })
  defineEmits(['update:modelValue'])
  const modelValue = defineModel()
  </script>
  