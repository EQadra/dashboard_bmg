import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,

    // ✅ Redirige cualquier ruta que empiece con /api al backend Laravel
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // tu backend Laravel
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost:8000', // opcional si usas autenticación con Sanctum
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
