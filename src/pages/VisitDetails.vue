<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl dark:bg-primary-900/30" aria-hidden="true">
            {{ petEmoji }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Visit Details</h1>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Visit #{{ visitId }}</span>
              <span>•</span>
              <span>{{ visitStatus }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Badge :variant="isCompleted ? 'success' : 'warning'" size="sm">
            {{ isCompleted ? 'Completed' : 'In Progress' }}
          </Badge>
          <Button variant="outline" @click="$router.go(-1)">
            Back
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div class="space-y-6 lg:col-span-3">
        <Card>
          <template #header>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Visit Summary</h2>
          </template>
          <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p class="text-slate-500 dark:text-slate-400">Pet</p>
              <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ pet?.name || appointment?.petName || 'Unknown' }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p class="text-slate-500 dark:text-slate-400">Species</p>
              <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ pet ? getPetSpeciesLabel(pet) : 'Unknown' }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p class="text-slate-500 dark:text-slate-400">Scheduled Time</p>
              <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ visitTimeRange }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p class="text-slate-500 dark:text-slate-400">Veterinarian</p>
              <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ appointment?.veterinarianName || 'Assigned Veterinary Team' }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60 sm:col-span-2">
              <p class="text-slate-500 dark:text-slate-400">Visit Notes</p>
              <p class="mt-1 text-slate-700 dark:text-slate-300">
                {{ visitNotes || 'No recorded summary available yet.' }}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <template #header>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Visit Notes</h2>
          </template>
          <div v-if="canEdit">
            <textarea
              v-model="visitNotes"
              rows="5"
              class="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="Enter visit notes..."
            />
          </div>
          <div v-else>
            <p v-if="visitNotes" class="text-slate-700 dark:text-slate-300">{{ visitNotes }}</p>
            <p v-else class="text-slate-500 dark:text-slate-400">No notes recorded yet.</p>
          </div>
        </Card>

        <Card v-if="canEdit">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Treatments</h2>
              <Button variant="primary" size="sm" @click="addTreatment">
                Add Treatment
              </Button>
            </div>
          </template>
          <div v-if="treatments.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No treatments added yet.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(treatment, index) in treatments"
              :key="index"
              class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100">{{ treatment.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ treatment.description }}</p>
              </div>
              <Button variant="danger" size="sm" @click="removeTreatment(index)">
                Remove
              </Button>
            </div>
          </div>
        </Card>

        <Card v-if="canEdit">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Prescriptions</h2>
              <Button variant="primary" size="sm" @click="addPrescription">
                Add Prescription
              </Button>
            </div>
          </template>
          <div v-if="prescriptions.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No prescriptions added yet.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(prescription, index) in prescriptions"
              :key="index"
              class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div><span class="text-slate-500 dark:text-slate-400">Medication:</span> <span class="font-medium text-slate-900 dark:text-slate-100">{{ prescription.medication }}</span></div>
                <div><span class="text-slate-500 dark:text-slate-400">Dosage:</span> <span class="font-medium text-slate-900 dark:text-slate-100">{{ prescription.dosage }}</span></div>
                <div><span class="text-slate-500 dark:text-slate-400">Quantity:</span> <span class="font-medium text-slate-900 dark:text-slate-100">{{ prescription.quantity }}</span></div>
              </div>
              <Button variant="danger" size="sm" class="mt-3" @click="removePrescription(index)">
                Remove
              </Button>
            </div>
          </div>
        </Card>

        <Card v-if="canEdit && !isCompleted">
          <template #header>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Invoice Amount</h2>
          </template>
          <Input
            label="Total Visit Amount"
            v-model="invoiceAmount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g., 120.00"
          />
        </Card>

        <Card v-if="visit?.invoice">
          <template #header>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Invoice</h2>
          </template>
          <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <pre class="text-sm text-slate-700 dark:text-slate-300">{{ JSON.stringify(visit.invoice, null, 2) }}</pre>
          </div>
        </Card>

        <div class="flex justify-end" v-if="canEdit && !isCompleted">
          <Button variant="success" @click="completeVisit" :disabled="completing">
            {{ completing ? 'Completing...' : 'Complete Visit' }}
          </Button>
        </div>
        <div v-if="completionError" class="rounded-lg border border-danger-300 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
          {{ completionError }}
        </div>
        <div v-if="completionSuccess" class="rounded-lg border border-success-300 bg-success-50 p-3 text-sm text-success-700 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300">
          {{ completionSuccess }}
        </div>
      </div>

      <div class="space-y-6 lg:col-span-2">
        <Card v-if="pet">
          <template #header>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Pet Information</h2>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-2"><span class="text-slate-500 dark:text-slate-400">Name</span><span class="font-medium text-slate-900 dark:text-slate-100">{{ pet.name }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-slate-500 dark:text-slate-400">Species</span><span class="font-medium text-slate-900 dark:text-slate-100">{{ getPetSpeciesLabel(pet) }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-slate-500 dark:text-slate-400">Breed</span><span class="font-medium text-slate-900 dark:text-slate-100">{{ getPetBreedLabel(pet) }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-slate-500 dark:text-slate-400">Age</span><span class="font-medium text-slate-900 dark:text-slate-100">{{ petAge }}</span></div>
            <div class="flex justify-between gap-2"><span class="text-slate-500 dark:text-slate-400">Date of Birth</span><span class="font-medium text-slate-900 dark:text-slate-100">{{ formatDate(pet.dateOfBirth) }}</span></div>
          </div>
        </Card>

        <Card>
          <template #header>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Veterinarian</h2>
          </template>
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300">
              {{ canEdit ? 'DR' : 'VT' }}
            </div>
            <div class="text-sm">
              <p class="font-medium text-slate-900 dark:text-slate-100">Assigned Veterinary Team</p>
              <p class="text-slate-500 dark:text-slate-400">Clinical care and follow-up coordination</p>
            </div>
          </div>
        </Card>

        <Card>
          <template #header>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Visit Timeline</h2>
          </template>
          <ol class="space-y-3">
            <li
              v-for="event in timelineEvents"
              :key="event.label"
              class="flex items-start gap-3"
            >
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" aria-hidden="true" />
              <div class="text-sm">
                <p class="font-medium text-slate-900 dark:text-slate-100">{{ event.label }}</p>
                <p class="text-slate-500 dark:text-slate-400">{{ event.time }}</p>
              </div>
            </li>
          </ol>
        </Card>
      </div>
    </div>

    <!-- Modals -->
    <Modal :is-open="showTreatmentModal" @close="showTreatmentModal = false">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Add Treatment</h3>
      </template>
      <div class="space-y-4">
        <Input
          label="Treatment Name"
          v-model="newTreatment.name"
          placeholder="e.g., Vaccination"
        />
        <Input
          label="Description"
          v-model="newTreatment.description"
          placeholder="Treatment details..."
        />
      </div>
      <template #footer>
        <Button variant="secondary" @click="showTreatmentModal = false">
          Cancel
        </Button>
        <Button variant="primary" @click="saveTreatment">
          Add Treatment
        </Button>
      </template>
    </Modal>

    <Modal :is-open="showPrescriptionModal" @close="showPrescriptionModal = false">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Add Prescription</h3>
      </template>
      <div class="space-y-4">
        <Input
          label="Medication"
          v-model="newPrescription.medication"
          placeholder="e.g., Amoxicillin"
        />
        <Input
          label="Dosage"
          v-model="newPrescription.dosage"
          placeholder="e.g., 500mg"
        />
        <Input
          label="Quantity"
          v-model="newPrescription.quantity"
          type="number"
          placeholder="e.g., 30"
        />
      </div>
      <template #footer>
        <Button variant="secondary" @click="showPrescriptionModal = false">
          Cancel
        </Button>
        <Button variant="primary" @click="savePrescription">
          Add Prescription
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { appointmentsService, type Appointment, type Visit, type Prescription } from '@/services/appointments'
import { ownersService, type Pet } from '@/services/owners'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Badge from '@/components/ui/Badge.vue'
import { resolvePetSpeciesKey, translatePetBreed, translatePetSpecies } from '@/utils/petLocalization'

const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const appointment = ref<Appointment | null>(null)
const visit = ref<Visit | null>(null)
const pet = ref<Pet | null>(null)
const loading = ref(true)
const completing = ref(false)
const completionError = ref('')
const completionSuccess = ref('')

const visitNotes = ref('')
const treatments = ref<Array<{ name: string; description: string }>>([])
const prescriptions = ref<Prescription[]>([])
const invoiceAmount = ref('50')

const showTreatmentModal = ref(false)
const showPrescriptionModal = ref(false)
const newTreatment = ref({ name: '', description: '' })
const newPrescription = ref({ medication: '', dosage: '', quantity: '' })

const visitId = route.params.id as string

const breadcrumbItems = computed(() => {
  if (authStore.roles.includes('Vet')) {
    return [
      { label: t('dashboard.vet.todaySchedule'), to: '/vet/appointments' },
      { label: `${t('visits.title')} ${visitId}` }
    ]
  }

  return [
    { label: t('visits.title'), to: '/owner/history' },
    { label: `${t('visits.title')} ${visitId}` }
  ]
})

const canEdit = computed(() => authStore.roles.includes('Vet'))

const petEmoji = computed(() => {
  const speciesKey = resolvePetSpeciesKey(pet.value?.species || '')
  if (speciesKey === 'dog') return '🐕'
  if (speciesKey === 'cat') return '🐱'
  if (speciesKey === 'bird') return '🐦'
  return '🐾'
})

const petAge = computed(() => {
  if (!pet.value?.dateOfBirth) return 'Unknown'
  const birth = new Date(pet.value.dateOfBirth)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  return years <= 0 ? 'Less than 1 year' : `${years} years`
})

const oneHourAfterStart = computed(() => {
  if (!appointment.value?.startAt) return null

  const startDate = new Date(appointment.value.startAt)
  if (Number.isNaN(startDate.getTime())) return null

  return new Date(startDate.getTime() + 60 * 60 * 1000)
})

const visitTimeRange = computed(() => {
  if (!appointment.value?.startAt) return 'Not scheduled'

  const startDate = new Date(appointment.value.startAt)
  if (Number.isNaN(startDate.getTime()) || !oneHourAfterStart.value) return 'Not scheduled'

  return `${formatDateTime(startDate.toISOString())} - ${formatTime(oneHourAfterStart.value.toISOString())}`
})

const isCompleted = computed(() => {
  if (visit.value?.invoice) return true
  if (!appointment.value?.status) return false
  return appointment.value.status === 'Completed'
})

const visitStatus = computed(() => {
  if (visit.value?.statusLocalized) return visit.value.statusLocalized

  const rawStatus = visit.value?.status || appointment.value?.status || (isCompleted.value ? 'Completed' : 'Open')
  const map: Record<string, string> = {
    Open: 'visits.status_open',
    Pending: 'appointments.status_pending',
    Confirmed: 'appointments.status_confirmed',
    Scheduled: 'appointments.status_scheduled',
    Completed: 'appointments.status_completed',
    Cancelled: 'appointments.status_cancelled'
  }

  const key = map[rawStatus]
  if (!key) {
    return canEdit.value ? 'Ready to complete' : 'In progress'
  }

  const localized = t(key)
  return localized === key ? rawStatus : localized
})

const timelineEvents = computed(() => {
  return [
    { label: 'Scheduled start', time: appointment.value?.startAt ? formatTime(appointment.value.startAt) : 'Pending' },
    { label: 'Scheduled end', time: oneHourAfterStart.value ? formatTime(oneHourAfterStart.value.toISOString()) : 'Pending' },
    { label: 'Notes updated', time: visitNotes.value ? 'Recorded' : 'Pending' },
    { label: 'Visit completion', time: isCompleted.value ? 'Completed' : 'Pending' }
  ]
})

onMounted(async () => {
  await loadDetails()
})

const loadDetails = async () => {
  try {
    let loadedAppointment: Appointment | null = null
    let loadedVisit: Visit | null = null

    try {
      loadedAppointment = await appointmentsService.getAppointmentById(visitId)
    } catch {
      // The route may contain a visit id.
    }

    try {
      loadedVisit = await appointmentsService.getVisit(visitId)
    } catch {
      // Current API may not expose visit retrieval for this route id.
    }

    if (!loadedAppointment && loadedVisit?.appointmentId) {
      try {
        loadedAppointment = await appointmentsService.getAppointmentById(loadedVisit.appointmentId)
      } catch {
        // Keep details partially populated when appointment lookup fails.
      }
    }

    appointment.value = loadedAppointment
    visit.value = loadedVisit
    visitNotes.value = loadedVisit?.notes || loadedAppointment?.notes || ''

    await loadPet()
  } catch (error) {
    console.error('Failed to load visit details', error)
  } finally {
    loading.value = false
  }
}

const loadPet = async () => {
  if (!appointment.value?.petId) {
    pet.value = null
    return
  }

  try {
    const pets = canEdit.value
      ? await ownersService.getAllPets()
      : await ownersService.getPets()
    const match = pets.find((item) => item.id.toLowerCase() === appointment.value?.petId.toLowerCase())
    pet.value = match || null
  } catch {
    pet.value = null
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getPetSpeciesLabel = (item: Pet) => {
  return translatePetSpecies(item.species, t, item.speciesLocalized)
}

const getPetBreedLabel = (item: Pet) => {
  return translatePetBreed(item.breed, t, item.breedLocalized)
}

const addTreatment = () => {
  newTreatment.value = { name: '', description: '' }
  showTreatmentModal.value = true
}

const saveTreatment = () => {
  if (newTreatment.value.name && newTreatment.value.description) {
    treatments.value.push({ ...newTreatment.value })
    showTreatmentModal.value = false
  }
}

const removeTreatment = (index: number) => {
  treatments.value.splice(index, 1)
}

const addPrescription = () => {
  newPrescription.value = { medication: '', dosage: '', quantity: '' }
  showPrescriptionModal.value = true
}

const savePrescription = () => {
  const quantity = parseInt(newPrescription.value.quantity)
  if (newPrescription.value.medication && newPrescription.value.dosage && quantity > 0) {
    prescriptions.value.push({
      medication: newPrescription.value.medication,
      dosage: newPrescription.value.dosage,
      quantity: quantity
    })
    showPrescriptionModal.value = false
  }
}

const removePrescription = (index: number) => {
  prescriptions.value.splice(index, 1)
}

const completeVisit = async () => {
  const targetId = visit.value?.id || appointment.value?.id || visitId
  const parsedInvoiceAmount = Number.parseFloat(invoiceAmount.value)

  if (!Number.isFinite(parsedInvoiceAmount) || parsedInvoiceAmount <= 0) {
    completionError.value = 'Invoice amount must be greater than 0.'
    return
  }

  completing.value = true
  completionError.value = ''
  completionSuccess.value = ''
  try {
    await appointmentsService.completeVisit(targetId, {
      notes: visitNotes.value,
      prescriptions: prescriptions.value,
      invoiceAmount: parsedInvoiceAmount
    })
    await loadDetails()
    completionSuccess.value = 'Visit completed successfully.'
  } catch (error) {
    const responseData = (error as any)?.response?.data
    const nestedMessage =
      typeof responseData?.error === 'object' && responseData?.error
        ? responseData.error.message
        : null
    completionError.value =
      responseData?.message ||
      nestedMessage ||
      (typeof responseData === 'string' ? responseData : null) ||
      'Failed to complete visit. Please try again.'
    console.error('Failed to complete visit', error)
  } finally {
    completing.value = false
  }
}
</script>