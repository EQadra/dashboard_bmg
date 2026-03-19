<script setup>
import { reactive } from 'vue'
import { useSidebarStore } from '../stores/useSidebarStore'
import { useAuthStore } from '../stores/useAuthStore'
import {
  Menu,
  BadgeCheck,
  ListOrdered,
  Tag,
  CreditCard,
  ShieldCheck,
  Users,
  ChevronDown,
  Moon,
  Sun,
  LogOut,
  Wallet,
  Lock,
} from 'lucide-vue-next'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const { isDark, toggleDarkMode } = sidebarStore

const handleLogout = async () => {
  await authStore.logout()
}

// 📦 MODULES (NO SE TOCA)
const modules = reactive([
  { name: 'Usuarios', icon: Users, to: '/admin/user-management' },
  {
    name: 'Autorización',
    icon: ShieldCheck,
    open: false,
    options: [
      { name: 'Roles', icon: BadgeCheck, to: '/admin/roles' },
      { name: 'Permisos', icon: Lock, to: '/admin/permissions' },
      { name: 'Roles y permisos', icon: Lock, to: '/admin/role-has-permission' },
    ],
  },
  { name: 'Lista Promociones', icon: Tag, to: '/dashboard/news' },
  { name: 'Transacción', icon: CreditCard, to: '/dashboard/transactions' },
  { name: 'Lista Transacciones', icon: ListOrdered, to: '/dashboard/transaction-list' },
  { name: 'Apertura de caja', icon: Wallet, to: '/dashboard/cash-register' },
  { name: 'Empresa', icon: Wallet, to: '/dashboard/company' },
])
</script>

<template>
  <div class="flex w-full h-screen overflow-hidden bg-[#0b1a33] text-white">

    <!-- SIDEBAR -->
    <aside
      :class="[
        'flex flex-col justify-between h-full transition-all duration-300 shadow-2xl',
        sidebarStore.isOpen ? 'w-64' : 'w-20'
      ]"
      class="bg-gradient-to-b from-[#0f1e3a] to-[#162d5c]"
    >

      <!-- TOP -->
      <div>
        <!-- HEADER -->
        <div class="flex items-center justify-between px-4 py-5">
          <div class="flex items-center gap-3">
            <span v-if="sidebarStore.isOpen" class="font-semibold text-lg">
              BMGOro
            </span>
          </div>

          <button
            @click="sidebarStore.toggleSidebar()"
            class="p-2 rounded-md hover:bg-white/10 transition"
          >
            <Menu size="18" class="mx-2" />
          </button>
        </div>

        <!-- SECTION -->
        <p
          v-if="sidebarStore.isOpen"
          class="px-6 mt-4 mb-2 text-xs tracking-widest text-cyan-300"
        >
          MODULES
        </p>

        <!-- NAV -->
        <nav>
          <ul>
            <li v-for="module in modules" :key="module.name">

              <!-- LINK DIRECTO -->
              <router-link
                v-if="module.to"
                :to="module.to"
                class="group flex items-center gap-3 px-4 py-3 mx-3 my-2 rounded-xl
                       border border-white/10
                       transition-all duration-300
                       hover:bg-cyan-400/10"
                :class="{
                  'bg-cyan-400/20 border-cyan-400 shadow-[0_0_12px_#22d3ee]':
                    $route.path === module.to
                }"
              >
                <component
                  :is="module.icon"
                  size="20"
                  class="text-cyan-300"
                />
                <span v-if="sidebarStore.isOpen" class="text-sm">
                  {{ module.name }}
                </span>
              </router-link>

              <!-- CON SUBMENU -->
              <div v-else>
                <button
                  @click="module.open = !module.open"
                  class="flex items-center justify-between w-[calc(100%-1.5rem)]
                         px-4 py-3 mx-3 my-2 rounded-xl
                         border border-white/10
                         hover:bg-white/10 transition"
                >
                  <div class="flex items-center gap-3">
                    <component
                      :is="module.icon"
                      size="20"
                      class="text-cyan-300"
                    />
                    <span v-if="sidebarStore.isOpen" class="text-sm">
                      {{ module.name }}
                    </span>
                  </div>

                  <ChevronDown
                    v-if="sidebarStore.isOpen"
                    size="16"
                    :class="{ 'rotate-180': module.open }"
                    class="transition-transform"
                  />
                </button>

                <ul v-if="module.open" class="ml-10">
                  <li v-for="option in module.options" :key="option.name">
                    <router-link
                      :to="option.to"
                      class="flex items-center gap-2 px-3 py-2 my-1 rounded-lg
                             text-sm text-white/80
                             hover:bg-cyan-400/10 transition"
                    >
                      <component :is="option.icon" size="16" />
                      <span v-if="sidebarStore.isOpen">{{ option.name }}</span>
                    </router-link>
                  </li>
                </ul>
              </div>

            </li>
          </ul>
        </nav>
      </div>

      <!-- LOGOUT -->
      <div class="p-4">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2
                 py-2 rounded-xl
                 border border-red-500/40
                 text-red-400
                 hover:bg-red-500/20 transition"
        >
          <LogOut size="18" />
          <span v-if="sidebarStore.isOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- MAIN -->
<!-- MAIN -->
<main class="flex-1 p-6 overflow-auto bg-[#0b1a33]">
  <div class="flex items-center justify-end gap-4 mb-6">
    <!-- Imagen/icono adicional al lado (ejemplo: calculadora pequeña o logo gold) -->
    <div class="flex items-center gap-2 text-cyan-300 font-medium">
      <!-- Opción 1: Ícono de Lucide (recomendado, ligero y vectorial) -->
      <Wallet size="24" class="text-cyan-400 drop-shadow" />
      <!-- O Opción 2: Imagen pequeña (si prefieres foto) -->
      <!-- <img 
        src="https://images.pexels.com/photos/8442322/pexels-photo-8442322.jpeg?auto=compress&cs=tinysrgb&w=60&h=60" 
        alt="Calculadora BMGOro" 
        class="w-8 h-8 rounded-full object-cover border-2 border-cyan-500/30 shadow-sm"
      /> -->
      <span v-if="sidebarStore.isOpen" class="text-sm">BMGOro</span>
    </div>

    <!-- Botón de dark/light mode - CORREGIDO para que funcione -->
    <button
      @click="sidebarStore.toggleDarkMode()"
      class="p-3 rounded-full hover:bg-white/10 transition-all duration-200 
             border border-white/10 hover:border-cyan-400/50 
             text-cyan-300 hover:text-cyan-100 shadow-sm flex items-center justify-center"
      :title="sidebarStore.isDark ? 'Modo Claro' : 'Modo Oscuro'"
    >
      <Moon v-if="sidebarStore.isDark" size="24" class="drop-shadow-md" />
      <Sun v-else size="24" class="drop-shadow-md" />
    </button>
  </div>

  <router-view />
</main>

  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.layout {
  display: flex;
  height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
}

/* ===== SIDEBAR ===== */
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--bg-sidebar);
  transition: width 0.3s;
  box-shadow: 4px 0 20px rgba(0,0,0,.3);
}

.sidebar.open { width: 260px; }
.sidebar.closed { width: 80px; }

.sidebar-header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-box {
  background: #22d3ee;
  color: black;
  padding: 4px 8px;
  font-weight: bold;
  border-radius: 6px;
}

.section-title {
  padding: 0 20px;
  font-size: 12px;
  color: #67e8f9;
}

/* ===== NAV ===== */
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background .2s;
}

.nav-link:hover {
  background: rgba(34,211,238,.15);
}

.nav-link.active {
  background: rgba(34,211,238,.3);
  box-shadow: 0 0 10px #22d3ee;
}

.submenu {
  margin-left: 30px;
}

.submenu-link {
  display: flex;
  gap: 8px;
  padding: 8px;
  font-size: 14px;
  opacity: .85;
}

.rotate {
  transform: rotate(180deg);
}

/* ===== MAIN ===== */
.main {
  flex: 1;
  padding: 24px;
  background: var(--bg-main);
  overflow-y: auto;
}

.topbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

/* ===== LOGOUT ===== */
.logout button {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 12px;
}

/* ===== LIGHT ===== */
html.light {
  --bg-main: #f5f7fa;
  --bg-sidebar: linear-gradient(#0f1e3a, #162d5c);
  --text-main: #111827;
}

/* ===== DARK ===== */
html.dark {
  --bg-main: #0b1a33;
  --bg-sidebar: linear-gradient(#0f1e3a, #162d5c);
  --text-main: #e5e7eb;
}
</style>