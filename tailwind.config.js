/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",  // ← asegúrate de que incluya tus .vue
  ],
  darkMode: 'class',  // ← 'class' para toggle manual con .dark en <html>
  theme: {
    extend: {
      colors: {
        // tus colores custom si los tienes
      },
    },
  },
  plugins: [],
}