<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-xl font-semibold text-white ring-4 ring-primary-100 dark:ring-primary-900/30">
            {{ vetInitials }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Good {{ timeOfDay }}, Dr. {{ vetName }}
            </h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ specialization }}</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ formattedToday }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button
            v-for="range in ranges"
            :key="range.value"
            size="sm"
            :variant="activeRange === range.value ? 'primary' : 'outline'"
            @click="activeRange = range.value"
          >
            {{ range.label }}
          </Button>
          <Button variant="primary" size="sm" @click="$router.push('/booking')">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            New Appointment
          </Button>
          <Button variant="outline" size="sm" @click="$router.push('/vet/patients')">
            <UsersIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            View Patients
          </Button>
        </div>
      </div>
    </div>

    <Card v-if="visibleAlerts.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <ExclamationTriangleIcon class="h-5 w-5 text-danger-500" aria-hidden="true" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
          <Badge variant="danger" size="sm">{{ visibleAlerts.length }}</Badge>
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="item in visibleAlerts"
          :key="item.id"
          class="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          :class="alertClasses(item)"
        >
          <div>
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-sm opacity-90">Current: {{ item.quantity }} {{ item.unit }} | Reorder at {{ item.reorderLevel }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="danger" size="sm" @click="orderMore(item)">Order More</Button>
            <Button variant="ghost" size="sm" @click="dismissAlert(item.id)">Dismiss</Button>
          </div>
        </div>
      </div>
    </Card>

    <div
      v-if="reorderSuccessMessage"
      class="rounded-lg border border-success-300 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300"
    >
      {{ reorderSuccessMessage }}
    </div>

    <Card v-if="incomingReorders.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <Badge variant="primary" size="sm">Incoming</Badge>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Scheduled Deliveries</h2>
        </div>
      </template>

      <div class="space-y-2">
        <div
          v-for="incoming in incomingReorders"
          :key="incoming.reorderId"
          class="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800 dark:border-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
        >
          {{ incoming.quantity }} units of {{ incoming.medicationName }} will arrive at {{ formatDeliveryTime(incoming.deliveryAtUtc) }}.
        </div>
      </div>
    </Card>

    <Card>
      <template #header>
        <div class="flex items-center gap-2">
          <Badge variant="success" size="sm">Delivered</Badge>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Delivered History</h2>
        </div>
      </template>

      <div v-if="deliveredReorders.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        No delivered reorders yet.
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="delivered in deliveredReorders"
          :key="delivered.reorderId"
          class="rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300"
        >
          {{ delivered.quantity }} units of {{ delivered.medicationName }} were delivered at {{ formatDeliveryTime(delivered.receivedAtUtc) }}.
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <button
        type="button"
        class="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-left shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:from-blue-900/20 dark:to-blue-800/20"
        @click="activeStatusFilter = 'all'"
      >
        <p class="text-sm text-slate-600 dark:text-slate-300">Appointments</p>
        <p class="mt-1 text-3xl font-bold text-blue-700 dark:text-blue-300">{{ filteredByRange.length }}</p>
      </button>
      <button
        type="button"
        class="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-green-100 p-5 text-left shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:from-green-900/20 dark:to-green-800/20"
        @click="activeStatusFilter = 'completed'"
      >
        <p class="text-sm text-slate-600 dark:text-slate-300">Completed Visits</p>
        <p class="mt-1 text-3xl font-bold text-green-700 dark:text-green-300">{{ completedVisits }}</p>
      </button>
      <button
        type="button"
        class="rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 text-left shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:from-yellow-900/20 dark:to-yellow-800/20"
        @click="activeStatusFilter = 'pending'"
      >
        <p class="text-sm text-slate-600 dark:text-slate-300">Pending Items</p>
        <p class="mt-1 text-3xl font-bold text-yellow-700 dark:text-yellow-300">{{ pendingVisits }}</p>
      </button>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Appointments</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Active window: {{ activeRangeLabel }} | Filter: {{ activeStatusLabel }}</p>
          </div>
          <Button variant="primary" size="sm" @click="refreshAppointments">
            <ArrowPathIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </template>
      <div v-if="loadingAppointments" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Loading appointments...</p>
      </div>
      <div v-else-if="displayAppointments.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">No appointments for the selected range/filter.</p>
      </div>
      <div v-else>
        <AppointmentList
          :appointments="displayAppointments"
          :show-confirm="true"
          :show-start="true"
          :show-cancel="true"
          @view="viewAppointment"
          @confirm="confirmAppointment"
          @start="startVisit"
          @cancel="cancelAppointment"
        />
      </div>
    </Card>

    <Modal :is-open="showReorderModal" title="Reorder Item" @close="closeReorderModal">
      <div class="space-y-4" v-if="selectedReorderItem">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <p class="font-medium">{{ selectedReorderItem.name }}</p>
          <p>Current stock: {{ selectedReorderItem.quantity }} {{ selectedReorderItem.unit }}</p>
          <p>Reorder level: {{ selectedReorderItem.reorderLevel }}</p>
        </div>

        <Input
          v-model="reorderQuantity"
          type="number"
          label="Quantity to reorder"
          min="1"
          placeholder="Enter quantity"
          :error="reorderError"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="reorderLoading" @click="closeReorderModal">Cancel</Button>
          <Button variant="primary" :loading="reorderLoading" @click="submitReorder">Reorder</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import { appointmentsService, type Appointment } from '@/services/appointments'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import {
  inventoryService,
  type PendingInventoryReorder,
  type DeliveredInventoryReorder
} from '@/services/inventory'

const router = useRouter()

// Data
const appointments = ref<Appointment[]>([])
const loadingAppointments = ref(true)
const vetName = ref('Smith')
const specialization = ref('General Practitioner')
const activeRange = ref<'today' | 'week' | 'month'>('week')
const activeStatusFilter = ref<'all' | 'completed' | 'pending'>('all')
const dismissedAlertIds = ref<string[]>([])
const reorderSuccessMessage = ref('')
const showReorderModal = ref(false)
const selectedReorderItem = ref<LowStockItem | null>(null)
const reorderQuantity = ref('1')
const reorderError = ref('')
const reorderLoading = ref(false)
const incomingReorders = ref<PendingInventoryReorder[]>([])
const deliveredReorders = ref<DeliveredInventoryReorder[]>([])

const ranges = [
  { label: 'Today', value: 'today' as const },
  { label: 'This week', value: 'week' as const },
  { label: 'This month', value: 'month' as const }
]

type LowStockItem = {
  id: string
  name: string
  quantity: number
  reorderLevel: number
  unit: string
}

const lowStockItems = ref<LowStockItem[]>([
  { id: '1', name: 'Rabies Vaccine', quantity: 5, reorderLevel: 10, unit: 'doses' },
  { id: '2', name: 'Amoxicillin', quantity: 2, reorderLevel: 8, unit: 'bottles' }
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

const formattedToday = computed(() => {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const filteredByRange = computed(() => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return appointments.value.filter((app) => {
    const d = new Date(app.startAt)
    if (activeRange.value === 'today') {
      return d.toDateString() === now.toDateString()
    }
    if (activeRange.value === 'week') {
      const end = new Date(startOfToday)
      end.setDate(now.getDate() + 7)
      return d >= startOfToday && d <= end
    }
    const end = new Date(startOfToday)
    end.setMonth(now.getMonth() + 1)
    return d >= startOfToday && d <= end
  })
})

const displayAppointments = computed(() => {
  if (activeStatusFilter.value === 'completed') {
    return filteredByRange.value.filter((a) => a.status === 'Completed')
  }
  if (activeStatusFilter.value === 'pending') {
    return filteredByRange.value.filter((a) => a.status === 'Pending' || a.status === 'Confirmed' || a.status === 'Scheduled')
  }
  return filteredByRange.value
})

const completedVisits = computed(() => {
  return filteredByRange.value.filter((app) => app.status === 'Completed').length
})

const pendingVisits = computed(() => {
  return filteredByRange.value.filter((app) => app.status === 'Pending' || app.status === 'Confirmed' || app.status === 'Scheduled').length
})

const visibleAlerts = computed(() => {
  return lowStockItems.value.filter((item) => !dismissedAlertIds.value.includes(item.id))
})

const activeRangeLabel = computed(() => {
  return ranges.find((r) => r.value === activeRange.value)?.label || 'Today'
})

const activeStatusLabel = computed(() => {
  if (activeStatusFilter.value === 'completed') return 'Completed'
  if (activeStatusFilter.value === 'pending') return 'Pending'
  return 'All'
})

// Load data
onMounted(async () => {
  await loadAppointments()
  await loadLowStockItems()
  await loadIncomingReorders()
  await loadDeliveredReorders()
})

const loadAppointments = async () => {
  try {
    const data = await appointmentsService.getAppointments()
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
  await loadLowStockItems()
  await loadIncomingReorders()
  await loadDeliveredReorders()
}

const loadLowStockItems = async () => {
  try {
    const data = await inventoryService.getLowStock()
    lowStockItems.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      unit: item.unit
    }))
  } catch (error) {
    console.error('Failed to load low stock items', error)
  }
}

const loadIncomingReorders = async () => {
  try {
    incomingReorders.value = await inventoryService.getIncomingReorders()
  } catch (error) {
    console.error('Failed to load incoming reorders', error)
  }
}

const loadDeliveredReorders = async () => {
  try {
    deliveredReorders.value = await inventoryService.getDeliveredReorders()
  } catch (error) {
    console.error('Failed to load delivered reorders', error)
  }
}

const formatDeliveryTime = (dateUtc: string) => {
  return new Date(dateUtc).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewAppointment = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const startVisit = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const confirmAppointment = async (appointment: Appointment) => {
  try {
    await appointmentsService.confirmAppointment(appointment.id)
    await loadAppointments()
  } catch (error) {
    console.error('Failed to confirm appointment', error)
  }
}

const cancelAppointment = async (appointment: Appointment) => {
  try {
    await appointmentsService.cancelAppointment(appointment.id)
    await loadAppointments()
  } catch (error) {
    console.error('Failed to cancel appointment', error)
  }
}

const dismissAlert = (id: string) => {
  dismissedAlertIds.value.push(id)
}

const alertClasses = (item: LowStockItem) => {
  if (item.quantity <= item.reorderLevel / 2) {
    return 'border-danger-300 bg-danger-50 text-danger-800 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300'
  }
  return 'border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-950/30 dark:text-warning-300'
}

const orderMore = (item: LowStockItem) => {
  selectedReorderItem.value = item
  reorderQuantity.value = String(Math.max(1, item.reorderLevel))
  reorderError.value = ''
  showReorderModal.value = true
}

const closeReorderModal = () => {
  showReorderModal.value = false
  reorderLoading.value = false
  reorderError.value = ''
  selectedReorderItem.value = null
}

const submitReorder = async () => {
  if (!selectedReorderItem.value) {
    return
  }

  const quantity = Number(reorderQuantity.value)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    reorderError.value = 'Please enter a valid quantity greater than zero.'
    return
  }

  reorderLoading.value = true
  reorderError.value = ''

  try {
    const result = await inventoryService.reorderMedication(selectedReorderItem.value.id, quantity)
    const deliveryLocal = new Date(result.deliveryAtUtc).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    reorderSuccessMessage.value = `Reorder confirmed for ${result.medicationName}. Package will arrive tomorrow at ${deliveryLocal}.`
    closeReorderModal()
    await loadLowStockItems()
    await loadIncomingReorders()
    await loadDeliveredReorders()
  } catch (error) {
    console.error('Failed to reorder inventory item', error)
    reorderError.value = 'Could not place reorder. Please try again.'
  } finally {
    reorderLoading.value = false
  }
}
</script>