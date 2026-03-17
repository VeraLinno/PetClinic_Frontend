<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar -->
    <aside
      :class="sidebarClasses"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 bg-primary">
        <h1 class="text-xl font-bold text-white">Pet Clinic</h1>
      </div>
      
      <!-- User Info Section -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div 
            class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold"
            aria-hidden="true"
          >
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ userRole }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="mt-4 px-4 space-y-1" role="menubar">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          active-class="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-primary"
          role="menuitem"
        >
          <span class="mr-3 text-lg" aria-hidden="true">{{ item.icon }}</span>
          <span class="text-sm font-medium">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer - Logout -->
      <div class="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Logout from your account"
        >
          <span class="mr-3" aria-hidden="true">🚪</span>
          <span class="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
      @click="closeSidebar"
      aria-hidden="true"
      role="presentation"
    ></div>

    <!-- Main content area -->
    <div :class="mainClasses">
      <!-- Topbar -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Left: Hamburger + Search -->
          <div class="flex items-center">
            <!-- Mobile hamburger button -->
            <button
              @click="toggleSidebar"
              class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
              :aria-expanded="sidebarOpen"
              aria-controls="sidebar"
            >
              <span class="sr-only">Open sidebar</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <!-- Search Bar - Full width on mobile, inline on desktop -->
            <div class="ml-4 lg:ml-6 w-full max-w-md">
              <label for="search" class="sr-only">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search pets, appointments..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Search pets and appointments"
                />
              </div>
            </div>
          </div>

          <!-- Right: Actions + User -->
          <div class="flex items-center space-x-3">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDarkMode" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- Notifications -->
            <button
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary relative"
              aria-label="View notifications"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="unreadNotifications > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            </button>

            <!-- User Profile -->
            <div class="flex items-center space-x-2">
              <div 
                class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold"
                aria-hidden="true"
              >
                {{ userInitials }}
              </div>
              <span class="hidden md:block text-sm text-gray-700 dark:text-gray-300">{{ user?.email }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main 
        class="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900"
        role="main"
      >
        <div class="container-main">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const searchQuery = ref('')
const isDarkMode = ref(false)
const unreadNotifications = ref(2)

const user = computed(() => authStore.user)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userName = computed(() => (user.value as any)?.name || user.value?.email || '')

const userInitials = computed(() => {
  const name = userName.value
  if (name) {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return user.value?.email?.[0]?.toUpperCase() || 'U'
})

const userRole = computed(() => {
  if (authStore.roles.includes('Owner')) return 'Pet Owner'
  if (authStore.roles.includes('Vet')) return 'Veterinarian'
  return 'User'
})

const menuItems = computed(() => {
  const items = []

  if (authStore.roles.includes('Owner')) {
    items.push(
      { path: '/owner', label: 'Dashboard', icon: '🏠' },
      { path: '/booking', label: 'Book Appointment', icon: '📅' },
      { path: '/owner/pets', label: 'My Pets', icon: '🐾' },
      { path: '/owner/appointments', label: 'Appointments', icon: '📋' },
      { path: '/owner/history', label: 'Visit History', icon: '📜' },
      { path: '/owner/invoices', label: 'Invoices', icon: '💳' },
      { path: '/owner/health', label: 'Health Records', icon: '🏥' }
    )
  }

  if (authStore.roles.includes('Vet')) {
    items.push(
      { path: '/vet', label: 'Dashboard', icon: '🏥' },
      { path: '/vet/appointments', label: "Today's Appointments", icon: '📅' },
      { path: '/vet/inventory', label: 'Inventory', icon: '💊' },
      { path: '/vet/patients', label: 'Patients', icon: '🐾' }
    )
  }

  return items
})

const sidebarClasses = computed(() => {
  return sidebarOpen.value ? 'translate-x-0' : '-translate-x-full'
})

const mainClasses = computed(() => {
  return 'lg:pl-64 flex flex-col min-h-screen transition-colors duration-300'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  updateDarkMode()
}

const updateDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Initialize dark mode from localStorage
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else if (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  // Close sidebar on route change (mobile)
  router.afterEach(() => {
    sidebarOpen.value = false
  })
})

// Watch for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') === null) {
      isDarkMode.value = e.matches
      updateDarkMode()
    }
  })
}
</script>
