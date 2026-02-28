// src/stores/sidebarStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

export const useSidebarStore = defineStore('Sidebar', () => {
  const isOpen = ref(true)

  // 🌙 DARK MODE GLOBAL
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
  })

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    console.log('🌙 Dark mode (store):', isDark.value)
  }

  return { isOpen, toggleSidebar, isDark, toggleDarkMode }
})
