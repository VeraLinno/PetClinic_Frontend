<template>
  <div class="space-y-6">
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('appointments.title') }}</h1>
            <p class="mt-1 text-slate-500 dark:text-slate-400">{{ $t('appointments.subtitle') }}</p>
          </div>
          <Button variant="primary" size="sm" @click="$router.push('/booking')">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            {{ $t('appointments.bookNew') }}
          </Button>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loadingAppointments" class="space-y-0">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="py-4 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <div class="flex items-center space-x-4">
            <div class="skeleton-avatar flex-shrink-0"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="skeleton-text w-3/4"></div>
              <div class="skeleton-text w-1/2"></div>
            </div>
            <div class="skeleton w-20 h-8 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="upcomingAppointments.length === 0" class="text-center py-12">
        <CalendarDaysIcon class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">{{ $t('appointments.noUpcomingAppointments') }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('appointments.noUpcomingAppointmentsDesc') }}</p>
        <Button variant="primary" class="mt-4" @click="$router.push('/booking')">
          <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
          {{ $t('appointments.bookNew') }}
        </Button>
      </div>

      <!-- Appointments List -->
      <AppointmentList 
        v-else
        :appointments="upcomingAppointments" 
        :loading="loadingAppointments"
        :show-cancel="true"
        @view="viewAppointment" 
        @cancel="cancelAppointment" 
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { appointmentsService, type Appointment } from '@/services/appointments'
import { ownersService, type Pet } from '@/services/owners'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import { PlusCircleIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { t } = useI18n()

// Data
const appointments = ref<Appointment[]>([])
const pets = ref<Pet[]>([])
const loadingAppointments = ref(true)

// Computed
const upcomingAppointments = computed(() => {
  return appointments.value.filter(a => {
    const apptDate = a.dateTime || a.startAt
    return apptDate && new Date(apptDate) > new Date()
  })
})

// Load data
onMounted(async () => {
  await loadPets()
  await loadAppointments()
})

const filterAppointmentsToOwnedPets = (items: Appointment[]) => {
  const ownedPetIds = new Set(pets.value.map((pet) => pet.id.toLowerCase()))
  const petNameById = new Map(pets.value.map((pet) => [pet.id.toLowerCase(), pet.name]))

  return items
    .filter((appointment) => ownedPetIds.has(appointment.petId.toLowerCase()))
    .map((appointment) => ({
      ...appointment,
      petName: petNameById.get(appointment.petId.toLowerCase()) || appointment.petName
    }))
}

const loadAppointments = async () => {
  try {
    const data = await appointmentsService.getAppointments()
    appointments.value = filterAppointmentsToOwnedPets(data)
  } catch (error) {
    console.error('Failed to load appointments', error)
  } finally {
    loadingAppointments.value = false
  }
}

const loadPets = async () => {
  try {
    const data = await ownersService.getPets()
    pets.value = data
  } catch (error) {
    console.error('Failed to load pets', error)
  }
}

// Actions
const viewAppointment = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
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
