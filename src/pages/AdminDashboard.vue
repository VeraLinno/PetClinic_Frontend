<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('admin.title') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('admin.subtitle') }}</p>
          <p v-if="lastUpdatedAt" class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {{ t('admin.lastUpdated') }}: {{ formatDateTime(lastUpdatedAt) }}
          </p>
        </div>
        <Button variant="primary" size="sm" :loading="loading" @click="loadDashboardData">
          {{ t('admin.refresh') }}
        </Button>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-lg border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-800 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300"
    >
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.totalUsers') }}</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.totalUsers ?? 0 }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.totalVets') }}</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.totalVeterinarians ?? 0 }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.totalPets') }}</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.totalPets ?? 0 }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.totalRevenue') }}</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{{ formatCurrency(metrics?.totalRevenueThisMonth ?? 0) }}</p>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.monthAppointments') }}</p>
        <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.totalAppointmentsThisMonth ?? 0 }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.monthCompletedVisits') }}</p>
        <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.completedVisitsThisMonth ?? 0 }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.lowStock') }}</p>
        <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ metrics?.lowStockMedications ?? 0 }}</p>
      </Card>
    </div>

    <Card>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('admin.systemHealth') }}</h2>
          <Badge :variant="healthVariant" size="sm">{{ health?.status || '-' }}</Badge>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ t('admin.activeUsers') }}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ health?.activeUsers ?? 0 }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ t('admin.dbConnections') }}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ health?.databaseConnections ?? 0 }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ t('admin.cpuUsage') }}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ formatPercent(health?.cpuUsage ?? 0) }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ t('admin.memoryUsage') }}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ formatPercent(health?.memoryUsage ?? 0) }}</p>
        </div>
      </div>

      <p v-if="health?.issues" class="mt-4 rounded-md border border-warning-300 bg-warning-50 px-3 py-2 text-sm text-warning-800 dark:border-warning-700 dark:bg-warning-950/20 dark:text-warning-300">
        {{ health.issues }}
      </p>
    </Card>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('admin.users') }}</h2>
        </template>

        <div v-if="users.length === 0" class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.noUsers') }}</div>
        <div v-else class="space-y-2">
          <div
            v-for="user in recentUsers"
            :key="user.id"
            class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email }}</p>
              <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ user.email }}</p>
            </div>
            <Badge :variant="user.isActive ? 'success' : 'warning'" size="sm">
              {{ user.isActive ? t('admin.active') : t('admin.inactive') }}
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('admin.appointments') }}</h2>
        </template>

        <div v-if="appointments.length === 0" class="text-sm text-slate-500 dark:text-slate-400">{{ t('admin.noAppointments') }}</div>
        <div v-else class="space-y-2">
          <div
            v-for="appointment in recentAppointments"
            :key="appointment.id"
            class="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ appointment.petName || '-' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ appointment.ownerEmail || '-' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatDateTime(appointment.startAt) }}</p>
              </div>
              <Badge size="sm" :variant="statusVariant(appointment.status)">
                {{ appointment.statusLocalized || appointment.status }}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { adminService, type AdminAppointment, type AdminDashboardMetrics, type AdminSystemHealth, type AdminUser } from '@/services/admin'
import { useAuthStore } from '@/stores/auth'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const metrics = ref<AdminDashboardMetrics | null>(null)
const health = ref<AdminSystemHealth | null>(null)
const users = ref<AdminUser[]>([])
const appointments = ref<AdminAppointment[]>([])

const recentUsers = computed(() => users.value.slice(0, 8))

const recentAppointments = computed(() =>
  [...appointments.value]
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, 8)
)

const healthVariant = computed(() => {
  const status = (health.value?.status || '').toLowerCase()
  if (status.includes('healthy')) return 'success'
  if (status.includes('critical')) return 'danger'
  return 'warning'
})

const lastUpdatedAt = computed(() => health.value?.checkedAt || metrics.value?.generatedAt || '')

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

const canAccessAdmin = computed(() => authStore.isAuthenticated && normalizedRoles.value.includes('Admin'))

const loadDashboardData = async () => {
  if (!canAccessAdmin.value) {
    errorMessage.value = t('admin.forbidden')
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const [metricsData, healthData, usersData, appointmentsData] = await Promise.all([
      adminService.getMetrics(),
      adminService.getHealth(),
      adminService.getUsers(),
      adminService.getAppointments()
    ])

    metrics.value = metricsData
    health.value = healthData
    users.value = usersData
    appointments.value = appointmentsData
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 403) {
      errorMessage.value = t('admin.forbidden')
    } else {
      errorMessage.value = t('admin.loadFailed')
    }
  } finally {
    loading.value = false
  }
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value)
}

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`
}

const statusVariant = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized === 'completed') return 'success'
  if (normalized === 'cancelled') return 'danger'
  if (normalized === 'confirmed' || normalized === 'scheduled') return 'info'
  return 'warning'
}

onMounted(() => {
  if (!canAccessAdmin.value) {
    void router.replace('/login')
    return
  }

  void loadDashboardData()
})
</script>
