import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/RegisterPage.vue')
  },
  {
    path: '/owner',
    name: 'OwnerDashboard',
    component: () => import('@/pages/OwnerDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/vet',
    name: 'VetDashboard',
    component: () => import('@/pages/VetDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Admin'] }
  },
  {
    path: '/booking',
    name: 'BookingWizard',
    component: () => import('@/pages/BookingPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Vet'] }
  },
  {
    path: '/visit/:id',
    name: 'VisitPage',
    component: () => import('@/pages/VisitDetails.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Vet'] }
  },
  {
    path: '/owner/history',
    name: 'VisitHistory',
    component: () => import('@/pages/VisitHistory.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/owner/invoices',
    name: 'Invoices',
    component: () => import('@/pages/InvoicesPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/owner/health',
    name: 'HealthRecords',
    component: () => import('@/pages/HealthRecords.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/owner/pets',
    name: 'MyPets',
    component: () => import('@/pages/MyPetsPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/owner/appointments',
    name: 'OwnerAppointments',
    component: () => import('@/pages/OwnerAppointmentsPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Admin'] }
  },
  {
    path: '/vet/appointments',
    name: 'VetAppointments',
    component: () => import('@/pages/VetTodayAppointments.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/vet/inventory',
    name: 'Inventory',
    component: () => import('@/pages/InventoryPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/vet/patients',
    name: 'Patients',
    component: () => import('@/pages/PatientsPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/vet/accounts',
    name: 'VetAccounts',
    component: () => import('@/pages/VetAccountsPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/vet/availability',
    name: 'Availability',
    component: () => import('@/pages/VetAvailabilityPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet', 'Admin'] }
  },
  {
    path: '/admin/cleanup-preview',
    name: 'VetCleanupPreview',
    component: () => import('@/pages/VetCleanupPreviewPage.vue'),
    meta: { requiresAuth: true, roles: ['Admin'] }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getDefaultAuthenticatedRoute(roles: string[], adminViewMode: 'admin' | 'vet' | 'owner' | null): string {
  if (roles.includes('Admin')) {
    if (adminViewMode === 'vet') return '/vet'
    if (adminViewMode === 'owner') return '/owner'
    return '/admin'
  }
  if (roles.includes('Vet')) return '/vet'
  if (roles.includes('Owner')) return '/owner'
  return '/owner'
}

function normalizeRoles(rawRoles: unknown): string[] {
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

  return []
}

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const userRoles = normalizeRoles(authStore.roles)

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next(getDefaultAuthenticatedRoute(userRoles, authStore.adminViewMode))
    return
  }

  if (authStore.isAuthenticated && userRoles.includes('Admin')) {
    const adminViewMode = authStore.adminViewMode || 'admin'
    const requiredRoles = (to.meta.roles as string[] | undefined) || []

    if (adminViewMode === 'admin' && to.path !== '/admin') {
      next('/admin')
      return
    }

    if (adminViewMode === 'vet' && requiredRoles.length > 0 && !requiredRoles.includes('Vet')) {
      next('/vet')
      return
    }

    if (adminViewMode === 'owner' && requiredRoles.length > 0 && !requiredRoles.includes('Owner')) {
      next('/owner')
      return
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles) {
    const requiredRoles = to.meta.roles as string[]
    if (!requiredRoles.some(role => userRoles.includes(role))) {
      next(getDefaultAuthenticatedRoute(userRoles, authStore.adminViewMode))
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router