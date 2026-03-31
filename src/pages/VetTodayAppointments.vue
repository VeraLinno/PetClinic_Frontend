<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ $t('dashboard.vet.todaySchedule') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ formattedToday }}</p>
        </div>
        <Button variant="primary" size="sm" @click="refreshAppointments">
          <ArrowPathIcon class="mr-2 h-4 w-4" aria-hidden="true" />
          {{ $t('common.refresh') }}
        </Button>
      </div>
    </div>

    <Card>
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('appointments.listTitle') }}</h2>
      </template>

      <div v-if="loadingAppointments" class="py-8 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('dashboard.vet.loadingAppointments') }}</p>
      </div>

      <div v-else-if="todayAppointments.length === 0" class="py-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('dashboard.vet.noAppointments') }}</p>
      </div>

      <div v-else>
        <AppointmentList
          :appointments="todayAppointments"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { appointmentsService, type Appointment } from '@/services/appointments'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import AppointmentList from '@/components/AppointmentList.vue'

const router = useRouter()
const { locale } = useI18n()

const appointments = ref<Appointment[]>([])
const loadingAppointments = ref(true)

const formattedToday = computed(() => {
  return new Date().toLocaleDateString(locale.value || undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const todayAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter((appointment) => {
    return new Date(appointment.startAt).toDateString() === now.toDateString()
  })
})

onMounted(async () => {
  await loadAppointments()
})

const loadAppointments = async () => {
  try {
    appointments.value = await appointmentsService.getAppointments()
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
</script>