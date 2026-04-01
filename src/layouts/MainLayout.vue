<template>
  <div class="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-900">
    <!-- Sidebar -->
    <aside
      id="main-sidebar"
      :class="sidebarClasses"
      class="fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-800 lg:translate-x-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-200 bg-primary-500 px-4 dark:border-slate-700">
        <h1 class="text-xl font-semibold tracking-wide text-white">Pet Clinic</h1>
        <button
          class="rounded-md p-1 text-white/80 hover:bg-white/20 hover:text-white lg:hidden"
          @click="closeSidebar"
          aria-label="Close sidebar"
        >
          <XMarkIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div class="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 font-semibold text-white ring-2 ring-primary-100 dark:ring-primary-900/30"
            aria-hidden="true"
          >
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ userName }}</p>
            <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ userRole }}</p>
          </div>
        </div>
      </div>

      <nav class="mt-3 px-3" role="menubar">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          custom
          v-slot="{ href, navigate, isActive }"
          role="menuitem"
        >
          <a
            :href="href"
            @click="navigate"
            :class="[
              'group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'border-l-4 border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-950/30 dark:text-primary-300'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100'
            ]"
          >
            <component
              :is="item.icon"
              class="h-5 w-5 flex-shrink-0"
              :class="isActive ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </a>
        </router-link>
      </nav>

      <div class="absolute bottom-0 w-full border-t border-slate-200 p-3 dark:border-slate-700">
        <button
          @click="logout"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          :aria-label="$t('common.logout')"
        >
          <ArrowRightStartOnRectangleIcon class="h-5 w-5 text-slate-400" aria-hidden="true" />
          <span>{{ $t('common.logout') }}</span>
        </button>
      </div>
    </aside>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
      aria-hidden="true"
      role="presentation"
    >
    </div>

    <div :class="mainClasses">
      <header class="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center">
            <button
              @click="toggleSidebar"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 lg:hidden"
              :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
              :aria-expanded="sidebarOpen"
              aria-controls="main-sidebar"
            >
              <Bars3Icon class="h-6 w-6" aria-hidden="true" />
            </button>

            <div class="ml-4 w-full max-w-md lg:ml-6">
              <label for="search" class="sr-only">Search</label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  type="text"
                  v-model="searchQuery"
                  :placeholder="$t('common.search')"
                  class="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                  aria-label="Search pets and appointments"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <LanguageSwitcher />

            <button
              @click="toggleDarkMode"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <SunIcon v-if="isDarkMode" class="h-5 w-5" aria-hidden="true" />
              <MoonIcon v-else class="h-5 w-5" aria-hidden="true" />
            </button>

            <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {{ userInitials }}
              </div>
              <span class="hidden text-sm text-slate-700 dark:text-slate-300 md:block">{{ userEmail }}</span>
            </div>
          </div>
        </div>
      </header>

      <main 
        class="flex-1 bg-slate-50 p-4 dark:bg-slate-900 sm:p-6 lg:p-8"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ownersService, type Owner, type VeterinarianOption } from '@/services/owners'
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  CalendarDaysIcon,
  CreditCardIcon,
  DocumentTextIcon,
  HeartIcon,
  HomeIcon,
  IdentificationIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  SunIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const sidebarOpen = ref(false)
const searchQuery = ref('')
const isDarkMode = ref(false)
const ownerProfile = ref<Owner | null>(null)
const ownerProfileLoaded = ref(false)
const vetProfile = ref<VeterinarianOption | null>(null)
const vetProfileLoaded = ref(false)

const user = computed(() => authStore.user)
const normalizedRoles = computed(() => {
  const rawRoles = authStore.roles as unknown
  if (Array.isArray(rawRoles)) {
    return rawRoles
      .filter((role): role is string => typeof role === 'string')
      .map((role) => role.trim())
      .filter(Boolean)
  }

  if (typeof rawRoles === 'string') {
    return rawRoles
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean)
  }

  return [] as string[]
})

const userRecord = computed<Record<string, unknown>>(() => {
  if (!user.value) return {}
  return user.value as unknown as Record<string, unknown>
})

const getStringClaim = (...keys: string[]) => {
  for (const key of keys) {
    const value = userRecord.value[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return ''
}

const userEmail = computed(() => {
  return (
    getStringClaim(
    'email',
    'emailaddress',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    ) ||
    vetProfile.value?.email ||
    ownerProfile.value?.email ||
    ''
  )
})

const vetNameParts = computed(() => {
  const fullName = (vetProfile.value?.name || '').trim()
  if (!fullName) {
    return { firstName: '', lastName: '' }
  }

  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1]
  }
})

const userFirstName = computed(() => {
  return (
    getStringClaim(
    'given_name',
    'firstName',
    'firstname',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'
    ) ||
    vetNameParts.value.firstName ||
    ownerProfile.value?.firstName ||
    ''
  )
})

const userLastName = computed(() => {
  return (
    getStringClaim(
    'family_name',
    'lastName',
    'lastname',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
    ) ||
    vetNameParts.value.lastName ||
    ownerProfile.value?.lastName ||
    ''
  )
})

const userName = computed(() => {
  const fullNameFromParts = [userFirstName.value, userLastName.value].filter(Boolean).join(' ').trim()
  if (fullNameFromParts) {
    return fullNameFromParts
  }

  const candidate = getStringClaim(
    'name',
    'preferred_username',
    'unique_name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
  )

  return candidate || userEmail.value
})

const userInitials = computed(() => {
  if (userFirstName.value || userLastName.value) {
    return `${userFirstName.value[0] || ''}${userLastName.value[0] || ''}`.toUpperCase() || 'U'
  }

  const source = userName.value || userEmail.value
  if (source) {
    return source
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const subject = userRecord.value.sub
  if (typeof subject === 'string' && subject.length > 0) {
    return subject.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'U'
  }

  return 'U'
})

const userRole = computed(() => {
  if (normalizedRoles.value.includes('Admin')) return t('navigation.admin')
  if (normalizedRoles.value.includes('Owner')) return t('auth.petOwner')
  if (normalizedRoles.value.includes('Vet')) return t('auth.veterinarian')
  return t('common.home')
})

const menuItems = computed(() => {
  const items: Array<{ path: string; label: string; icon: unknown }> = []
  const isAdmin = normalizedRoles.value.includes('Admin')

  if (normalizedRoles.value.includes('Owner') || isAdmin) {
    items.push(
      { path: '/owner', label: isAdmin ? `${t('common.view')} ${t('auth.petOwner')}` : t('navigation.dashboard'), icon: HomeIcon },
      { path: '/booking', label: t('appointments.bookNew'), icon: PlusCircleIcon },
      { path: '/owner/pets', label: t('navigation.pets'), icon: SparklesIcon },
      { path: '/owner/appointments', label: t('navigation.appointments'), icon: ListBulletIcon },
      { path: '/owner/history', label: t('navigation.visits'), icon: DocumentTextIcon },
      { path: '/owner/invoices', label: t('navigation.invoices'), icon: CreditCardIcon },
      { path: '/owner/health', label: t('navigation.health'), icon: HeartIcon }
    )
  }

  if (normalizedRoles.value.includes('Vet') || isAdmin) {
    items.push(
      { path: '/vet', label: isAdmin ? `${t('common.view')} ${t('auth.veterinarian')}` : t('navigation.dashboard'), icon: HomeIcon },
      { path: '/booking', label: t('appointments.bookNew'), icon: PlusCircleIcon },
      { path: '/vet/appointments', label: t('dashboard.vet.todaySchedule'), icon: CalendarDaysIcon },
       { path: '/vet/availability', label: t('navigation.availability'), icon: CalendarDaysIcon },
      { path: '/vet/inventory', label: t('navigation.inventory'), icon: ShoppingBagIcon },
      { path: '/vet/patients', label: t('navigation.patients'), icon: UsersIcon },
      { path: '/vet/accounts', label: 'Vet Accounts', icon: IdentificationIcon }
    )
  }

  if (normalizedRoles.value.includes('Admin')) {
    items.push(
      { path: '/admin', label: t('navigation.admin'), icon: ShieldCheckIcon }
    )
  }

  return items
})

const loadOwnerProfile = async () => {
  if (ownerProfileLoaded.value || !normalizedRoles.value.includes('Owner')) return

  ownerProfileLoaded.value = true
  try {
    ownerProfile.value = await ownersService.getMe()
  } catch {
    ownerProfile.value = null
  }
}

const loadVetProfile = async () => {
  if (vetProfileLoaded.value || !normalizedRoles.value.includes('Vet')) return

  vetProfileLoaded.value = true
  try {
    const vets = await ownersService.getVeterinarians()
    const userId = getStringClaim(
      'sub',
      'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    )
    const normalizedEmail = userEmail.value.toLowerCase()

    vetProfile.value =
      vets.find((v) => v.id === userId) ||
      vets.find((v) => v.email.toLowerCase() === normalizedEmail) ||
      null
  } catch {
    vetProfile.value = null
  }
}

const sidebarClasses = computed(() => {
  return sidebarOpen.value ? 'translate-x-0 shadow-overlay' : '-translate-x-full'
})

const mainClasses = computed(() => {
  return 'lg:pl-72 flex min-h-screen flex-col transition-colors duration-300'
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
  // Clear auth state first, then navigate
  // This prevents any pending requests from triggering data fetches
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

  void loadOwnerProfile()
  void loadVetProfile()
})

watch(
  () => [authStore.isAuthenticated, normalizedRoles.value.join(',')],
  () => {
    if (!authStore.isAuthenticated) {
      ownerProfile.value = null
      ownerProfileLoaded.value = false
      vetProfile.value = null
      vetProfileLoaded.value = false
      return
    }

    void loadOwnerProfile()
    void loadVetProfile()
  },
  { immediate: true }
)

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
