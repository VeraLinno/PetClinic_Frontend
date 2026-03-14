import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue')
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
    path: '/booking',
    name: 'Booking',
    component: () => import('@/pages/BookingPage.vue'),
    meta: { requiresAuth: true, roles: ['Owner'] }
  },
  {
    path: '/visit/:id',
    name: 'VisitDetails',
    component: () => import('@/pages/VisitDetails.vue'),
    meta: { requiresAuth: true, roles: ['Owner', 'Vet'] }
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.roles) {
    const userRoles = authStore.roles
    const requiredRoles = to.meta.roles as string[]
    if (!requiredRoles.some(role => userRoles.includes(role))) {
      next('/login') // or 403
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router