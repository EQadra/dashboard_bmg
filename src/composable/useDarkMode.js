import { ref, watchEffect } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  // Init
  if (typeof window !== 'undefined') {
    isDark.value =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
  }

  // Sync with DOM
  watchEffect(() => {
    const html = document.documentElement

    if (isDark.value) {
      html.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      html.classList.remove('dark')
      localStorage.theme = 'light'
    }
  })

  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDark,
  }
}
