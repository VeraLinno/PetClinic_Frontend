<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('patients.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ $t('patients.manageRecords') }}</p>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('patients.allPatients') }}</h2>
          <div class="flex w-full flex-wrap gap-2 md:w-auto">
            <Input
              v-model="searchQuery"
              :placeholder="$t('patients.searchPlaceholder')"
              class="w-full md:w-64"
            />
            <select
              v-model="speciesFilter"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{{ $t('patients.allSpecies') }}</option>
              <option value="Dog">{{ $t('pets.species_dog') }}</option>
              <option value="Cat">{{ $t('pets.species_cat') }}</option>
              <option value="Bird">{{ $t('pets.species_bird') }}</option>
            </select>
            <Button variant="ghost" @click="speciesFilter = ''">{{ $t('common.reset') }}</Button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-else-if="filteredPatients.length === 0" class="text-center py-8 text-gray-500">
        {{ $t('patients.noPatients') }}
      </div>

      <div v-if="loadError" class="mt-3 rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
        {{ loadError }}
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="patient in filteredPatients"
          :key="patient.id"
          class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-card-hover dark:border-gray-700"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {{ getPetEmoji(patient.species) }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ patient.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ getSpeciesLabel(patient.species) }} - {{ getBreedLabel(patient.breed) }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('patients.ownerLabel') }}: {{ patient.ownerName }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ $t('patients.lastVisitLabel') }}: {{ formatDate(patient.lastVisit) }}</p>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <Button class="w-full" variant="outline" size="sm" @click="viewHistory(patient)">{{ $t('common.details') }}</Button>
                <Button class="w-full" variant="danger" size="sm" :loading="deletingPatientId === patient.id" @click="deletePatient(patient)">{{ $t('common.delete') }}</Button>
                <Button class="col-span-2 w-full" variant="primary" size="sm" @click="bookAppointment(patient)">{{ $t('pets.bookAppointment') }}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Modal :is-open="showDetailsModal" :title="selectedPatient?.name || $t('common.details')" @close="showDetailsModal = false">
      <div v-if="selectedPatient" class="space-y-4 text-sm">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <p class="text-slate-500 dark:text-slate-400">{{ $t('patients.ownerLabel') }}</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ selectedPatient.ownerName }}</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <p class="text-slate-500 dark:text-slate-400">{{ $t('patients.lastVisitLabel') }}</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ formatDate(selectedPatient.lastVisit) }}</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <p class="text-slate-500 dark:text-slate-400">{{ $t('pets.type') }}</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ getSpeciesLabel(selectedPatient.species) }}</p>
          </div>
          <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <p class="text-slate-500 dark:text-slate-400">{{ $t('pets.breed') }}</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ getBreedLabel(selectedPatient.breed) }}</p>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
          <p class="text-slate-500 dark:text-slate-400">{{ $t('visits.title') }}</p>
          <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ patientAppointments.length }} appointments</p>
        </div>

        <div v-if="patientAppointments.length > 0" class="space-y-2">
          <div
            v-for="appointment in patientAppointments"
            :key="appointment.id"
            class="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatAppointmentDate(appointment.startAt) }}</p>
                <p class="text-slate-500 dark:text-slate-400">{{ appointment.veterinarianName || $t('visits.assignedVet') }}</p>
              </div>
              <span class="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {{ appointment.statusLocalized || appointment.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            v-if="selectedPatient"
            variant="danger"
            :loading="deletingPatientId === selectedPatient.id"
            @click="deletePatient(selectedPatient)"
          >
            {{ $t('common.delete') }}
          </Button>
          <Button variant="outline" @click="showDetailsModal = false">{{ $t('common.close') }}</Button>
          <Button variant="primary" @click="startVisitFromDetails">{{ $t('dashboard.vet.startVisit') }}</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ownersService, type Pet } from '@/services/owners'
import { appointmentsService, type Appointment } from '@/services/appointments'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface Patient {
  id: string
  name: string
  species: string
  breed: string
  ownerName: string
  lastVisit?: string | null
}

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('patients.title') }
])

const patients = ref<Patient[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const speciesFilter = ref('')
const showDetailsModal = ref(false)
const selectedPatient = ref<Patient | null>(null)
const patientAppointments = ref<Appointment[]>([])
const allAppointments = ref<Appointment[]>([])
const deletingPatientId = ref<string | null>(null)

const filteredPatients = computed(() => {
  return patients.value.filter(patient => {
    const matchesSearch = !searchQuery.value || 
      patient.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSpecies = !speciesFilter.value || patient.species === speciesFilter.value
    return matchesSearch && matchesSpecies
  })
})

const loadPatients = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [appointments, pets]: [Appointment[], Pet[]] = await Promise.all([
      appointmentsService.getAppointments(),
      ownersService.getAllPets()
    ])

    allAppointments.value = appointments

    patients.value = pets.map((pet: Pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ownerName: pet.ownerName || t('common.notAvailable'),
      lastVisit: pet.lastVisitAt || null
    }))
  } catch (error: any) {
    loadError.value = error?.response?.data?.error || t('common.loadFailed')
    patients.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadPatients()
})

watch(
  () => route.query.search,
  (value) => {
    const queryValue = typeof value === 'string' ? value : ''
    if (queryValue !== searchQuery.value) {
      searchQuery.value = queryValue
    }
  }
)

watch(searchQuery, (value) => {
  const normalizedValue = value.trim()
  const currentQuery = typeof route.query.search === 'string' ? route.query.search : ''
  if (normalizedValue === currentQuery) {
    return
  }

  const nextQuery = { ...route.query }
  if (normalizedValue) {
    nextQuery.search = normalizedValue
  } else {
    delete nextQuery.search
  }

  router.replace({ query: nextQuery })
})

const getPetEmoji = (species: string) => {
  if (species.toLowerCase() === 'dog') return '🐕'
  if (species.toLowerCase() === 'cat') return '🐱'
  if (species.toLowerCase() === 'bird') return '🐦'
  return '🐾'
}

const normalizeTranslationKey = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const getSpeciesLabel = (species: string) => {
  const key = `pets.species_${normalizeTranslationKey(species)}`
  const translated = t(key)
  return translated === key ? species : translated
}

const getBreedLabel = (breed: string) => {
  const key = `pets.breed_${normalizeTranslationKey(breed)}`
  const translated = t(key)
  return translated === key ? breed : translated
}

const viewHistory = (patient: Patient) => {
  selectedPatient.value = patient
  const detailsAppointments = allAppointments.value
    .filter((appointment) => normalizeId(appointment.petId) === normalizeId(patient.id))
    .filter((appointment) => Boolean(appointment.veterinarianId))
    .sort((left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime())

  patientAppointments.value = detailsAppointments

  const latestAppointment = detailsAppointments[0]
  if (latestAppointment?.id) {
    void router.push(`/visit/${latestAppointment.id}`)
    return
  }

  showDetailsModal.value = true
}

const bookAppointment = (patient: Patient) => {
  sessionStorage.setItem('selectedPet', JSON.stringify(patient))
  void router.push('/booking')
}

const startVisit = (patient: Patient) => {
  const upcomingStatuses = new Set(['Confirmed', 'Scheduled', 'Pending'])
  const matchingAppointments = allAppointments.value
    .filter((appointment) => normalizeId(appointment.petId) === normalizeId(patient.id))
    .filter((appointment) => upcomingStatuses.has(appointment.status))
    .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime())

  const targetAppointment = matchingAppointments[0]
  if (targetAppointment?.id) {
    showDetailsModal.value = false
    void router.push(`/visit/${targetAppointment.id}`)
    return
  }

  bookAppointment(patient)
}

const startVisitFromDetails = () => {
  if (!selectedPatient.value) return
  startVisit(selectedPatient.value)
}

const formatAppointmentDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const normalizeId = (value?: string | null) => {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

const deletePatient = async (patient: Patient) => {
  const confirmed = window.confirm(`Delete patient ${patient.name}?`)
  if (!confirmed) return

  deletingPatientId.value = patient.id
  try {
    await ownersService.deletePetForVet(patient.id)
    if (selectedPatient.value?.id === patient.id) {
      showDetailsModal.value = false
      selectedPatient.value = null
      patientAppointments.value = []
    }
    await loadPatients()
  } catch {
    loadError.value = t('common.error')
  } finally {
    deletingPatientId.value = null
  }
}

const formatDate = (date?: string | null) => {
  if (!date) return t('common.notAvailable')
  return new Date(date).toLocaleDateString()
}
</script>
