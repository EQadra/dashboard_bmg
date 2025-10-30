// src/stores/sidebarStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

export const useSidebarStore = defineStore('Sidebar', () => {
  // Estado reactivo para el sidebar
  const isOpen = ref(true)

  // Estado reactivo para el modo oscuro
  const isDark = useDark() // Esto usa VueUse para gestionar el dark mode

  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
  }

  // Función para alternar el modo oscuro
  const toggleDarkMode = () => {
    isDark.value = !isDark.value // Alterna el valor del modo oscuro
  }

  return { isOpen, toggleSidebar, isDark, toggleDarkMode }
})
