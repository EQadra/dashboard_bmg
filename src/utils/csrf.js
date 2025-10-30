// src/utils/csrf.js
import { useAxios } from '../plugins/axios'

export async function getCsrfToken() {
  const api = useAxios()
  await api.get('/sanctum/csrf-cookie') // Laravel genera la cookie aquí
}












































// // src/utils/csrf.js
// import api from './axios';

// export async function getCsrfToken() {
//   // Para Laravel Sanctum: /sanctum/csrf-cookie
//   await api.get('/sanctum/csrf-cookie');
//   const token = document.cookie
//     .split('; ')
//     .find(row => row.startsWith('XSRF-TOKEN='))
//     ?.split('=')[1];
//   if (!token) throw new Error('XSRF-TOKEN no encontrado en cookies');
//   api.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(token);
// }



// // // src/utils/csrf.js
// // import axios from 'axios'

// // export const getCsrfToken = async () => {
// //   try {
// //     await axios.get('/sanctum/csrf-cookie')
// //     const token = document.cookie
// //       .split('; ')
// //       .find(row => row.startsWith('XSRF-TOKEN='))
// //       ?.split('=')[1]

// //     if (!token) throw new Error('XSRF-TOKEN no encontrado en cookies')
// //     axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(token)
// //   } catch (err) {
// //     console.error('❌ Error obteniendo CSRF cookie', err)
// //     throw new Error('No se pudo obtener el token CSRF')
// //   }
// // }
