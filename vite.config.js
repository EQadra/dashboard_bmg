import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    origin: 'http://localhost:5173',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8000',
    }
  }
})
