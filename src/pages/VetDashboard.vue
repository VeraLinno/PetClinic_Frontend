<template>
  <div class="space-y-6">
    <!-- Vet Profile Section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
            {{ vetInitials }}
          </div>
        </div>
        
        <!-- Vet Info -->
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Good {{ timeOfDay }}, Dr. {{ vetName }}!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">{{ specialization }}</p>
          <div class="flex flex-wrap gap-4 mt-4">
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium text-gray-900 dark:text-white">{{ appointments.length }}</span>
              <span class="ml-1">Today's Appointments</span>
            </div>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium text-gray-900 dark:text-white">{{ completedVisits }}</span>
              <span class="ml-1">Completed</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex flex-col gap-2">
          <Button variant="outline" size="sm" @click="$router.push('/vet/patients')">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Patients
          </Button>
        </div>
      </div>
    </div>

    <!-- Today's Appointments -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Today's Appointments</h2>
          <Button variant="primary" size="sm" @click="refreshAppointments">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </template>
      <div v-if="loadingAppointments" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Loading appointments...</p>
      </div>
      <div v-else-if="appointments.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">No appointments scheduled for today.</p>
      </div>
      <div v-else>
        <AppointmentList :appointments="appointments" @view="viewAppointment" @start="startVisit" />
      </div>
    </Card>

    <!-- Low Stock Alerts -->
    <Card v-if="lowStockItems.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
          <Badge variant="danger" size="sm">{{ lowStockItems.length }}</Badge>
        </div>
      </template>
      <div class="space-y-4">
        <div
          v-for="item in lowStockItems"
          :key="item.id"
          class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div>
            <h3 class="font-medium text-red-900 dark:text-red-400">{{ item.name }}</h3>
            <p class="text-sm text-red-700 dark:text-red-500">Current stock: {{ item.quantity }} {{ item.unit }}</p>
          </div>
          <Button variant="danger" size="sm" @click="orderMore(item)">
            Order More
          </Button>
        </div>
      </div>
    </Card>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ appointments.length }}</div>
          <div class="text-gray-600 dark:text-gray-400">Today's Appointments</div>
        </div>
      </Card>
      <Card class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ completedVisits }}</div>
          <div class="text-gray-600 dark:text-gray-400">Completed Visits</div>
        </div>
      </Card>
      <Card class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ pendingVisits }}</div>
          <div class="text-gray-600 dark:text-gray-400">Pending Visits</div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentsService, type Appointment } from '@/services/appointments'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import AppointmentList from '@/components/AppointmentList.vue'

const router = useRouter()

// Data
const appointments = ref<Appointment[]>([])
const loadingAppointments = ref(true)
const vetName = ref('Smith')
const specialization = ref('General Practitioner')

// Low stock items - would come from API
const lowStockItems = ref<Array<{id: string, name: string, quantity: number, unit: string}>>([
  { id: '1', name: 'Rabies Vaccine', quantity: 5, unit: 'doses' },
  { id: '2', name: 'Amoxicillin', quantity: 2, unit: 'bottles' }
])

// Computed
const vetInitials = computed(() => {
  return vetName.value ? vetName.value[0].toUpperCase() : 'V'
})

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
})

const completedVisits = computed(() => {
  return appointments.value.filter(app => app.status === 'Completed').length
})

const pendingVisits = computed(() => {
  return appointments.value.filter(app => app.status === 'Pending' || app.status === 'Confirmed').length
})

// Load data
onMounted(async () => {
  await loadAppointments()
  // TODO: Load low stock items from API
})

const loadAppointments = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const data = await appointmentsService.getAppointments({ date: today })
    appointments.value = data
  } catch (error) {
    console.error('Failed to load appointments', error)
  } finally {
    loadingAppointments.value = false
  }
}

const refreshAppointments = async () => {
  loadingAppointments.value = true
  await loadAppointments()
}

const viewAppointment = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const startVisit = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const orderMore = (item: any) => {
  // TODO: Implement order more functionality
  console.log('Order more for', item.name)
}
</script>