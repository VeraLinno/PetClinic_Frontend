<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <Card>
      <div class="space-y-5 p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('appointments.bookNew') }}</h1>
          </div>
          <div class="text-sm font-medium text-primary-700 dark:text-primary-300">
            {{ $t('appointments.stepIndicator', { current: currentStep + 1, total: steps.length }) }}
          </div>
        </div>

        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300" :style="{ width: `${progress}%` }" />
        </div>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            :class="[
              'rounded-lg border px-3 py-2 text-xs font-medium sm:text-sm',
              currentStep === index
                ? 'border-primary-500 bg-primary-50 text-primary-800 dark:border-primary-500 dark:bg-primary-950/30 dark:text-primary-300'
                : currentStep > index
                  ? 'border-success-300 bg-success-50 text-success-700 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300'
                  : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
            ]"
          >
            {{ step.title }}
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <div class="space-y-6 p-6">
        <div v-if="currentStep === 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('appointments.selectPet') }}</h2>
          <div v-if="pets.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 py-10 text-center text-gray-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            {{ $t('dashboard.owner.noPets') }}
          </div>
          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              v-for="pet in pets"
              :key="pet.id"
              :class="[
                'rounded-xl border p-4 text-left transition-all',
                selectedPet?.id === pet.id
                  ? 'border-primary-500 bg-primary-50 shadow-card dark:border-primary-500 dark:bg-primary-950/30'
                  : 'border-slate-300 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700'
              ]"
              @click="selectPet(pet)"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getPetEmoji(pet) }}</span>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate font-semibold text-slate-900 dark:text-slate-100">{{ pet.name }}</h3>
                  <p class="truncate text-sm text-slate-500 dark:text-slate-400">{{ getPetSpeciesLabel(pet) }} • {{ getPetBreedLabel(pet) }}</p>
                </div>
                <CheckCircleIcon
                  v-if="selectedPet?.id === pet.id"
                  class="h-5 w-5 text-primary-600 dark:text-primary-300"
                  aria-hidden="true"
                />
              </div>
            </button>
          </div>
        </div>

        <div v-if="currentStep === 1" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('appointments.selectDate') }}</h2>
          <div class="max-w-sm">
            <Input
              :label="$t('appointments.selectDate')"
              type="date"
              v-model="selectedDate"
              :min="minDate"
              required
            />
          </div>
          <div v-if="isSelectedDateUnavailable" class="rounded-lg border border-warning-300 bg-warning-50 p-4 text-warning-700 dark:border-warning-700 dark:bg-warning-950/30 dark:text-warning-300">
            <p class="font-medium">⚠️ {{ $t('appointments.dateUnavailable') }}</p>
            <p v-if="getUnavailableReason" class="mt-2 text-sm">
              {{ getUnavailableReason }}
            </p>
            <p class="mt-2 text-sm">{{ $t('appointments.selectDifferentDate') }}</p>
          </div>
        </div>

        <div v-if="currentStep === 2" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('appointments.selectTime') }}</h2>
          <div v-if="loadingSlots" class="py-8 text-center text-slate-500 dark:text-slate-400">{{ $t('appointments.loadingSlots') }}</div>
          <div v-else-if="availableSlots.length === 0" class="rounded-lg border border-warning-300 bg-warning-50 py-8 text-center text-warning-700 dark:border-warning-700 dark:bg-warning-950/30 dark:text-warning-300">
            {{ $t('appointments.noAvailableSlots') }}
          </div>
          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <button
              v-for="slot in availableSlots"
              :key="slot"
              :class="[
                'rounded-lg border p-3 text-center text-sm font-medium transition-colors',
                selectedTime === slot
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/30 dark:text-primary-300'
                  : 'border-slate-300 text-slate-700 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-primary-950/20'
              ]"
              @click="selectTime(slot)"
            >
              {{ formatTime(slot) }}
            </button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('appointments.confirmBooking') }}</h2>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt class="text-slate-500 dark:text-slate-400">{{ $t('appointments.pet') }}</dt>
                <dd class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ selectedPet?.name }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">{{ $t('appointments.date') }}</dt>
                <dd class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ formatDate(selectedDate) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500 dark:text-slate-400">{{ $t('appointments.time') }}</dt>
                <dd class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ formatTime(selectedTime) }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('appointments.veterinarian') }} <span class="text-danger-600">*</span></label>
            <select
              v-model="selectedVeterinarianId"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="" disabled>{{ $t('appointments.selectVet') }}</option>
              <option v-for="vet in veterinarians" :key="vet.id" :value="vet.id">
                {{ vet.name }} ({{ vet.email }})
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('appointments.notes') }} ({{ $t('appointments.optional') }})</label>
            <textarea
              v-model="notes"
              rows="3"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              :placeholder="$t('appointments.notesPlaceholder')"
            />
          </div>
        </div>

        <div v-if="bookingSuccess" class="rounded-xl border border-success-300 bg-success-50 p-5 text-success-800 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300">
          <div class="flex items-center gap-3">
            <CheckCircleIcon class="h-6 w-6" aria-hidden="true" />
            <p class="font-medium">{{ $t('appointments.bookedSuccess') }}</p>
          </div>
          <p class="mt-2 text-sm">{{ $t('appointments.redirectingDashboard') }}</p>
          <Button class="mt-4" variant="success" size="sm" @click="router.push(dashboardRoute)">{{ $t('appointments.goToDashboard') }}</Button>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            @click="previousStep"
            :disabled="currentStep === 0 || bookingSuccess"
          >
            {{ $t('common.previous') }}
          </Button>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" @click="$router.push(dashboardRoute)" :disabled="loading">{{ $t('common.cancel') }}</Button>
            <Button
              v-if="currentStep < steps.length - 1"
              variant="primary"
              @click="nextStep"
              :disabled="!canProceed || bookingSuccess"
            >
              {{ $t('common.next') }}
            </Button>
            <Button
              v-else
              variant="success"
              @click="confirmBooking"
              :disabled="loading || bookingSuccess"
              :loading="loading"
            >
              {{ loading ? $t('appointments.bookingInProgress') : $t('appointments.confirmBooking') }}
            </Button>
          </div>
        </div>

        <div v-if="error" class="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-center text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
          {{ error }}
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAvailabilityStore } from '@/stores/availability'
import { appointmentsService } from '@/services/appointments'
import { ownersService, type Pet, type VeterinarianOption } from '@/services/owners'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { translatePetBreed, translatePetSpecies } from '@/utils/petLocalization'

const router = useRouter()
const authStore = useAuthStore()
const availabilityStore = useAvailabilityStore()
const { t } = useI18n()

// Wizard state
const currentStep = ref(0)
const steps = [
  { id: 'pet', title: t('appointments.selectPet') },
  { id: 'date', title: t('appointments.selectDate') },
  { id: 'time', title: t('appointments.selectTime') },
  { id: 'confirm', title: t('appointments.confirmBooking') }
]

// Data
const pets = ref<Pet[]>([])
const selectedPet = ref<Pet | null>(null)
const selectedDate = ref('')
const selectedTime = ref('')
const selectedVeterinarianId = ref('')
const notes = ref('')
const availableSlots = ref<string[]>([])
const veterinarians = ref<VeterinarianOption[]>([])
const loading = ref(false)
const loadingSlots = ref(false)
const error = ref('')
const bookingSuccess = ref(false)

const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

const progress = computed(() => ((currentStep.value + 1) / steps.length) * 100)
const isVet = computed(() => authStore.roles.includes('Vet'))
const dashboardRoute = computed(() => (isVet.value ? '/vet' : '/owner'))

// Computed
const minDate = computed(() => {
  return getLocalDateKey(new Date())
})

const isSelectedDateUnavailable = computed(() => {
  if (!selectedDate.value) return false
  return availabilityStore.unavailablePeriods.some(
    (period) => selectedDate.value >= period.startDate && selectedDate.value <= period.endDate
  )
})

const getUnavailableReason = computed(() => {
  if (!selectedDate.value) return null
  const period = availabilityStore.unavailablePeriods.find(
    (p) => selectedDate.value >= p.startDate && selectedDate.value <= p.endDate
  )
  if (!period?.reason) return null

  const reasonMessages: Record<string, string> = {
    'Vacation': t('availability.reasons.vacation'),
    'Sick Leave': t('availability.reasons.sickLeave'),
    'Conference': t('availability.reasons.conference'),
    'Training': t('availability.reasons.training'),
    'Personal': t('availability.reasons.personal'),
    'Other': t('availability.reasons.other')
  }

  const resolvedReason = reasonMessages[period.reason] || period.reason
  return `${t('appointments.dateUnavailableWithReason')}: ${resolvedReason}`
})

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const isPastSlotForSelectedDate = (slot: string) => {
  if (!selectedDate.value) {
    return false
  }

  const now = new Date()
  if (selectedDate.value !== getLocalDateKey(now)) {
    return false
  }

  const slotDate = new Date(`${selectedDate.value}T${slot}:00`)
  return slotDate.getTime() <= now.getTime()
}

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return !!selectedPet.value
    case 1: return !!selectedDate.value && !isSelectedDateUnavailable.value
    case 2: return !!selectedTime.value
    case 3: return !!selectedVeterinarianId.value
    default: return false
  }
})

// Methods
  const loadPets = async () => {
    try {
      const data = isVet.value ? await ownersService.getAllPets() : await ownersService.getPets()
      pets.value = data
      // If pet was pre-selected from sessionStorage
      const storedPet = sessionStorage.getItem('selectedPet')
      if (storedPet) {
        const pet = JSON.parse(storedPet)
        selectedPet.value = pets.value.find(p => p.id === pet.id) || null
        sessionStorage.removeItem('selectedPet')
      }
    } catch (err) {
      console.error('Failed to load pets', err)
    }
  }

  const loadVeterinarians = async () => {
    try {
      veterinarians.value = await ownersService.getVeterinarians()
      if (isVet.value) {
        const currentUserId = authStore.user?.id?.toLowerCase()
        const currentVet = veterinarians.value.find((vet) => vet.id.toLowerCase() === currentUserId)
        if (currentVet) {
          selectedVeterinarianId.value = currentVet.id
        }
      }
    } catch (err) {
      console.error('Failed to load veterinarians', err)
    }
  }

const selectPet = (pet: Pet) => {
  selectedPet.value = pet
}

const getPetEmoji = (pet: Pet) => {
  const species = pet.species.toLowerCase()
  if (species.includes('dog')) return '🐕'
  if (species.includes('cat')) return '🐱'
  if (species.includes('bird')) return '🐦'
  if (species.includes('fish')) return '🐠'
  return '🐾'
}

const getPetSpeciesLabel = (pet: Pet) => {
  return translatePetSpecies(pet.species, t, pet.speciesLocalized)
}

const getPetBreedLabel = (pet: Pet) => {
  return translatePetBreed(pet.breed, t, pet.breedLocalized)
}

const nextStep = () => {
  if (currentStep.value === 1 && selectedDate.value) {
    if (isSelectedDateUnavailable.value) {
      const period = availabilityStore.unavailablePeriods.find(
        (p) => selectedDate.value >= p.startDate && selectedDate.value <= p.endDate
      )
      error.value = period?.reason
        ? `${t('appointments.dateUnavailableWithReason')}: ${period.reason}`
        : t('appointments.dateUnavailable')
      return
    }
    loadAvailableSlots()
  }
  if (canProceed.value && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

  const loadAvailableSlots = async () => {
    if (!selectedDate.value) return

    loadingSlots.value = true
    try {
      // TODO: Replace with real availability API once backend endpoint is available.
      availableSlots.value = defaultSlots.filter((slot) => !isPastSlotForSelectedDate(slot))

      if (selectedTime.value && !availableSlots.value.includes(selectedTime.value)) {
        selectedTime.value = ''
      }
    } catch (err) {
      console.error('Failed to load slots', err)
    } finally {
      loadingSlots.value = false
    }
  }

const selectTime = (time: string) => {
  selectedTime.value = time
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (time: string) => {
  return time
}

const toLocalDateTimeString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

  const confirmBooking = async () => {
    if (!selectedPet.value || !selectedDate.value || !selectedTime.value || !selectedVeterinarianId.value) {
      error.value = t('appointments.requiredFields')
      return
    }

  if (isSelectedDateUnavailable.value) {
    error.value = t('appointments.dateUnavailable')
    return
  }

  loading.value = true
  error.value = ''
  try {
    const startDateTime = new Date(`${selectedDate.value}T${selectedTime.value}:00`)

    if (startDateTime.getTime() <= Date.now()) {
      error.value = t('appointments.timeInPast')
      return
    }

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)
    const startAt = toLocalDateTimeString(startDateTime)
    const endAt = toLocalDateTimeString(endDateTime)

    await appointmentsService.createAppointment({
      petId: selectedPet.value.id,
      veterinarianId: selectedVeterinarianId.value || undefined,
      startAt,
      endAt
    })

    bookingSuccess.value = true
    setTimeout(() => {
      router.push(dashboardRoute.value)
    }, 1200)
  } catch (err: any) {
    error.value = err.response?.data?.message || t('appointments.bookingFailed')
    console.error('Error booking appointment:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadVeterinarians()
  await loadPets()
  await availabilityStore.fetchUnavailablePeriods()
})
</script>