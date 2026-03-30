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
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/vet',
    name: 'VetDashboard',
    component: () => import('@/pages/VetDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
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
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/owner/invoices',
    name: 'Invoices',
    component: () => import('@/pages/InvoicesPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/owner/health',
    name: 'HealthRecords',
    component: () => import('@/pages/HealthRecords.vue'),
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/owner/pets',
    name: 'MyPets',
    component: () => import('@/pages/MyPetsPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/owner/appointments',
    name: 'OwnerAppointments',
    component: () => import('@/pages/OwnerDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/vet/appointments',
    name: 'VetAppointments',
    component: () => import('@/pages/VetTodayAppointments.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
  },
  {
    path: '/vet/inventory',
    name: 'Inventory',
    component: () => import('@/pages/InventoryPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
  },
  {
    path: '/vet/patients',
    name: 'Patients',
    component: () => import('@/pages/PatientsPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
  },
  {
    path: '/vet/accounts',
    name: 'VetAccounts',
    component: () => import('@/pages/VetAccountsPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
  },
  {
    path: '/vet/availability',
    name: 'Availability',
    component: () => import('@/pages/VetAvailabilityPage.vue'),
    meta: { requiresAuth: true, roles: ['Vet'] }
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

function getDefaultAuthenticatedRoute(roles: string[]): string {
  if (roles.includes('Admin')) return '/admin'
  if (roles.includes('Vet')) return '/vet'
  if (roles.includes('Owner')) return '/owner'
  return '/owner'
}

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next(getDefaultAuthenticatedRoute(authStore.roles))
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles) {
    const userRoles = authStore.roles
    const requiredRoles = to.meta.roles as string[]
    if (!requiredRoles.some(role => userRoles.includes(role))) {
      next(getDefaultAuthenticatedRoute(userRoles))
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router