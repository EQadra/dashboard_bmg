import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

import BaseLayout from '../layouts/BaseLayout.vue'

// Auth
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'
import VerifyAccountView from '../views/auth/VerifyAccountView.vue'

// Errores
import NotFoundView from '../views/auth/NotFoundView.vue'
import AccessDeniedView from '../views/auth/AccessDeniedView.vue'

// Administración
import RolesView from '../views/auto/RolesView.vue'
import PermissionsView from '../views/auto/PermissionsView.vue'
import RolePermissionsView from '../views/auto/RolePermissionsView.vue'

// App
import HomeView from '../views/app/HomeView.vue'
import UserManagement from '../views/auto/UserManagementView.vue'
import TransactionView from '../views/app/TransactionView.vue'
import TransactionListView from '../views/app/TransactionListView.vue'
import NewsView from '../views/app/NewsView.vue'
import CashRegisterView from '../views/app/CashRegisterView.vue'

const routes = [
  { path: '/', redirect: { name: 'Login' } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView },
  { path: '/reset-password/:token', name: 'ResetPassword', component: ResetPasswordView },
  { path: '/verify-account', name: 'VerifyAccount', component: VerifyAccountView },

  {
    path: '/dashboard',
    component: BaseLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: HomeView },
      { path: 'transactions', name: 'Transactions', component: TransactionView },
      { path: 'transaction-list', name: 'TransactionList', component: TransactionListView },
      { path: 'news', name: 'news', component: NewsView },
      { path: 'cash-register', name: 'CashRegister', component: CashRegisterView }
    ]
  },

  {
    path: '/admin',
    component: BaseLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'user-management', name: 'UserManagement', component: UserManagement },
      { path: 'roles', name: 'Roles', component: RolesView },
      { path: 'permissions', name: 'Permissions', component: PermissionsView },
      { path: 'role-has-permission', name: 'RolesAndPermissions', component: RolePermissionsView }
    ]
  },

  // 🚫 Acceso denegado
  { path: '/access-denied', name: 'AccessDenied', component: AccessDeniedView },

  // ❌ 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware global con logs
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  console.group(`🔍 Navegación: ${from.fullPath || '(inicio)'} ➡️ ${to.fullPath}`)
  console.log('📌 Meta de la ruta:', to.meta)
  console.log('👤 Usuario actual:', auth.user)
  console.log('🛡️ Roles actuales:', auth.roles)

  if (to.meta.requiresAuth && !auth.user) {
    console.warn('⚠️ Ruta requiere autenticación, intentando fetchUser()...')
    try {
      await auth.fetchUser()
      console.log('✅ Usuario recuperado desde API:', auth.user)
    } catch (err) {
      console.error('❌ No autenticado, redirigiendo a login', err)
      console.groupEnd()
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }

  if (to.meta.requiresAdmin) {
    if (!auth.roles.includes('admin')) {
      console.error('⛔ Acceso denegado, el usuario no es admin')
      console.groupEnd()
      return next({ name: 'AccessDenied' })
    }
    console.log('✅ Usuario con rol admin, acceso permitido')
  }

  console.log('➡️ Acceso permitido a la ruta')
  console.groupEnd()
  next()
})

export default router
