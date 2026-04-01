<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div class="flex min-w-0 items-center gap-4">
          <div v-if="loadingOwner" class="skeleton h-16 w-16 rounded-full" />
          <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-2xl font-bold text-white ring-4 ring-primary-100 dark:ring-primary-900/30">
            {{ ownerInitials }}
          </div>

          <div class="min-w-0 flex-1">
            <div v-if="loadingOwner" class="space-y-3">
            <div class="skeleton h-8 w-64 rounded"></div>
            <div class="skeleton h-4 w-48 rounded"></div>
            <div class="skeleton h-4 w-32 rounded"></div>
            </div>
            <div v-else>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {{ $t('dashboard.owner.welcomeBack') }}, {{ owner?.firstName || 'Owner' }}
              </h1>
              <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{{ owner?.email }}</p>
              <div class="mt-3 flex flex-wrap gap-3 text-sm">
                <div class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                  <HeartIcon class="h-4 w-4" aria-hidden="true" />
                  <span class="font-medium">{{ pets.length }}</span>
                  <span>{{ $t('navigation.pets') }}</span>
                </div>
                <div class="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-warning-700 dark:bg-warning-950/30 dark:text-warning-300">
                  <CalendarDaysIcon class="h-4 w-4" aria-hidden="true" />
                  <span class="font-medium">{{ upcomingAppointments }}</span>
                  <span>{{ $t('appointments.status_scheduled') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid w-full gap-2 sm:w-auto sm:grid-cols-2 md:grid-cols-1">
          <Button variant="primary" size="sm" @click="$router.push('/booking')">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            {{ $t('appointments.bookNew') }}
          </Button>
          <Button variant="outline" size="sm" @click="openEditProfile">
            <PencilSquareIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            {{ $t('profile.editProfile') }}
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800">
        <div v-if="loadingPets" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-24 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="space-y-3">
          <div class="inline-flex rounded-lg bg-primary-100 p-3 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
            <HeartIcon class="h-6 w-6" aria-hidden="true" />
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ $t('pets.title') }}</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ pets.length }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800">
        <div v-if="loadingAppointments" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-28 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="space-y-3">
          <div class="inline-flex rounded-lg bg-success-100 p-3 text-success-700 dark:bg-success-950/30 dark:text-success-300">
            <CheckCircleIcon class="h-6 w-6" aria-hidden="true" />
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ $t('visits.title') }}</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ completedVisits }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800">
        <div v-if="loadingAppointments" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-28 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="space-y-3">
          <div class="inline-flex rounded-lg bg-warning-100 p-3 text-warning-700 dark:bg-warning-950/30 dark:text-warning-300">
            <ClockIcon class="h-6 w-6" aria-hidden="true" />
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ $t('appointments.status_scheduled') }}</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ pendingAppointments }}</p>
        </div>
      </div>
    </div>

    <!-- Pets Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('dashboard.owner.myPets') }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('dashboard.owner.managePets') }}</p>
          </div>
          <Button variant="primary" size="sm" @click="showAddPetModal = true">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            {{ $t('dashboard.owner.addPet') }}
          </Button>
        </div>
      </template>
      
      <!-- Loading Skeletons -->
      <div v-if="loadingPets" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="pets.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('dashboard.owner.noPetsCta') }}</p>
        <Button variant="primary" class="mt-4" @click="showAddPetModal = true">{{ $t('dashboard.owner.addFirstPet') }}</Button>
      </div>
      
      <!-- Pets Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PetCard
          v-for="pet in pets"
          :key="pet.id"
          :pet="pet"
          @book-appointment="bookAppointmentForPet"
          @view-details="viewPetDetails"
          @delete-pet="confirmDeletePet"
        />
      </div>
    </Card>

    <!-- Appointments Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('dashboard.owner.upcomingAppointments') }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('dashboard.owner.upcomingAppointmentsSubtitle') }}</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="$router.push('/owner/history')">
              {{ $t('dashboard.owner.viewHistory') }}
            </Button>
            <Button variant="primary" size="sm" @click="$router.push('/booking')">
              {{ $t('dashboard.owner.bookNew') }}
            </Button>
          </div>
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
      
      <!-- Appointments List -->
      <AppointmentList 
        :appointments="appointments" 
        :loading="loadingAppointments"
        :show-cancel="true"
        @view="viewAppointment" 
        @cancel="cancelAppointment" 
      />
    </Card>

    <!-- Add Pet Modal -->
    <Modal :is-open="showAddPetModal" :title="$t('dashboard.owner.addPetModalTitle')" @close="showAddPetModal = false">
      <form @submit.prevent="submitPet" class="space-y-4">
        <Input
          v-model="newPet.name"
          :label="$t('pets.name')"
          :placeholder="$t('pets.name')"
          required
          :error="petErrors.name"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('pets.type') }}</label>
            <select
              v-model="newPet.species"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary',
                petErrors.species ? 'border-danger-500 dark:border-danger-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              required
            >
              <option value="">{{ $t('appointments.selectPet') }}</option>
              <option value="Dog">{{ $t('pets.species_dog') }}</option>
              <option value="Cat">{{ $t('pets.species_cat') }}</option>
              <option value="Bird">{{ $t('pets.species_bird') }}</option>
              <option value="Rabbit">{{ $t('pets.species_rabbit') }}</option>
              <option value="Hamster">{{ $t('pets.species_hamster') }}</option>
              <option value="Fish">{{ $t('pets.species_fish') }}</option>
              <option value="Reptile">{{ $t('pets.species_reptile') }}</option>
              <option value="Other">{{ $t('pets.species_other') }}</option>
            </select>
            <p v-if="petErrors.species" class="mt-1 text-sm text-danger-600 dark:text-danger-400">{{ petErrors.species }}</p>
          </div>
          <Input
            v-model="newPet.breed"
            :label="$t('pets.breed')"
            :placeholder="$t('pets.breed')"
            required
            :error="petErrors.breed"
          />
        </div>
        <Input
          v-model="newPet.dateOfBirth"
          :label="$t('pets.dateOfBirth')"
          type="date"
          required
          :error="petErrors.dateOfBirth"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showAddPetModal = false">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" @click="submitPet" :disabled="submittingPet">
            {{ submittingPet ? $t('dashboard.owner.adding') : $t('dashboard.owner.addPet') }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Pet Details Modal -->
    <Modal :is-open="showPetDetailsModal" :title="selectedPetForDetails?.name" @close="showPetDetailsModal = false">
      <div v-if="selectedPetForDetails" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('pets.type') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ getPetSpeciesLabel(selectedPetForDetails) }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('pets.breed') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ getPetBreedLabel(selectedPetForDetails) }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('pets.dateOfBirth') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatDate(selectedPetForDetails.dateOfBirth) }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('pets.age') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ petAge(selectedPetForDetails.dateOfBirth) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showPetDetailsModal = false">{{ $t('common.close') }}</Button>
          <Button variant="primary" @click="bookAppointmentForPet(selectedPetForDetails!)">{{ $t('dashboard.owner.bookAppointment') }}</Button>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" :title="$t('dashboard.owner.deletePetTitle')" @close="showDeleteModal = false">
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('dashboard.owner.deletePetConfirm') }} <strong>{{ petToDelete?.name }}</strong>? {{ $t('dashboard.owner.deletePetWarning') }}
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDeleteModal = false">{{ $t('common.cancel') }}</Button>
          <Button variant="danger" @click="deletePet" :disabled="deletingPet">
            {{ deletingPet ? $t('pets.deleting') : $t('common.delete') }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Edit Profile Modal -->
    <Modal :is-open="showEditProfile" :title="$t('dashboard.owner.editProfileTitle')" @close="showEditProfile = false">
      <form @submit.prevent="submitProfile" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="profileForm.firstName"
            :label="$t('auth.firstName')"
            :placeholder="$t('auth.firstName')"
            :error="profileErrors.firstName"
          />
          <Input
            v-model="profileForm.lastName"
            :label="$t('auth.lastName')"
            :placeholder="$t('auth.lastName')"
            :error="profileErrors.lastName"
          />
        </div>
        <Input
          v-model="profileForm.email"
          :label="$t('auth.email')"
          type="email"
          :placeholder="$t('auth.email')"
          required
          :error="profileErrors.email"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showEditProfile = false">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" @click="submitProfile" :disabled="submittingProfile">
            {{ submittingProfile ? $t('dashboard.owner.saving') : $t('dashboard.owner.saveChanges') }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Toast for notifications -->
    <Toast v-model:show="showToast" :type="toastType" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { appointmentsService, type Appointment } from '@/services/appointments'
import { ownersService, type Owner, type Pet } from '@/services/owners'
import { translatePetBreed, translatePetSpecies } from '@/utils/petLocalization'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Toast from '@/components/ui/Toast.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import PetCard from '@/components/PetCard.vue'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  PencilSquareIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// Data
const appointments = ref<Appointment[]>([])
const pets = ref<Pet[]>([])
const owner = ref<Owner | null>(null)
const loadingAppointments = ref(true)
const loadingPets = ref(true)
const loadingOwner = ref(true)

// Modal states
const showAddPetModal = ref(false)
const showDeleteModal = ref(false)
const showEditProfile = ref(false)
const showPetDetailsModal = ref(false)
const petToDelete = ref<Pet | null>(null)
const selectedPetForDetails = ref<Pet | null>(null)

// Form states
const newPet = ref({
  name: '',
  species: '',
  breed: '',
  dateOfBirth: ''
})
const petErrors = ref<Record<string, string>>({})
const submittingPet = ref(false)
const deletingPet = ref(false)
const submittingProfile = ref(false)
const profileErrors = ref<Record<string, string>>({})
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: ''
})

// Toast
const showToast = ref(false)
const toastType = ref<'success' | 'error' | 'warning'>('success')
const toastMessage = ref('')

// Computed
const ownerInitials = computed(() => {
  if (owner.value?.firstName) {
    return `${owner.value.firstName[0]}${owner.value.lastName?.[0] || ''}`.toUpperCase()
  }
  return 'U'
})

const upcomingAppointments = computed(() => {
  return appointments.value.filter(a => {
    const apptDate = a.dateTime || a.startAt
    return apptDate && new Date(apptDate) > new Date()
  }).length
})

const completedVisits = computed(() => {
  return appointments.value.filter(a => a.status === 'Completed').length
})

const pendingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'Pending').length
})

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

const canLoadOwnerData = computed(() => authStore.isAuthenticated && normalizedRoles.value.includes('Owner'))

const isExpectedAuthError = (error: unknown) => {
  const status = (error as any)?.response?.status
  return (status === 401 || status === 403) && !canLoadOwnerData.value
}

// Load data
onMounted(async () => {
  if (!canLoadOwnerData.value) {
    loadingPets.value = false
    loadingOwner.value = false
    loadingAppointments.value = false
    return
  }

  await Promise.all([
    loadPets(),
    loadOwner()
  ])

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
  if (!canLoadOwnerData.value) {
    loadingAppointments.value = false
    return
  }

  try {
    const data = await appointmentsService.getAppointments()
    appointments.value = filterAppointmentsToOwnedPets(data)
  } catch (error) {
    if (!isExpectedAuthError(error)) {
      console.error('Failed to load appointments', error)
      showNotification('error', t('dashboard.owner.appointmentsLoadFailed'))
    }
  } finally {
    loadingAppointments.value = false
  }
}

const loadPets = async () => {
  if (!canLoadOwnerData.value) {
    loadingPets.value = false
    return
  }

  try {
    const data = await ownersService.getPets()
    pets.value = data
  } catch (error) {
    if (!isExpectedAuthError(error)) {
      console.error('Failed to load pets', error)
      showNotification('error', t('dashboard.owner.petsLoadFailed'))
    }
  } finally {
    loadingPets.value = false
  }
}

const loadOwner = async () => {
  if (!canLoadOwnerData.value) {
    loadingOwner.value = false
    return
  }

  try {
    const data = await ownersService.getMe()
    owner.value = data
  } catch (error) {
    if (!isExpectedAuthError(error)) {
      console.error('Failed to load owner', error)
    }
  } finally {
    loadingOwner.value = false
  }
}

const openEditProfile = () => {
  profileErrors.value = {}
  profileForm.value = {
    firstName: owner.value?.firstName || '',
    lastName: owner.value?.lastName || '',
    email: owner.value?.email || ''
  }
  showEditProfile.value = true
}

// Actions
const viewAppointment = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const cancelAppointment = async (appointment: Appointment) => {
  try {
    await appointmentsService.cancelAppointment(appointment.id)
    showNotification('success', t('appointments.cancelled'))
    await loadAppointments()
  } catch (error) {
    showNotification('error', t('appointments.cancelFailed'))
  }
}

const bookAppointmentForPet = (pet: Pet) => {
  sessionStorage.setItem('selectedPet', JSON.stringify(pet))
  router.push('/booking')
}

const confirmDeletePet = (pet: Pet) => {
  petToDelete.value = pet
  showDeleteModal.value = true
}

const deletePet = async () => {
  if (!petToDelete.value) return
  
  deletingPet.value = true
  try {
    await ownersService.deletePet(petToDelete.value.id)
    showNotification('success', t('dashboard.owner.petDeletedSuccess'))
    showDeleteModal.value = false
    await loadPets()
  } catch (error) {
    showNotification('error', t('dashboard.owner.petDeleteFailed'))
  } finally {
    deletingPet.value = false
  }
}

const submitPet = async () => {
  petErrors.value = {}
  
  if (!newPet.value.name) {
    petErrors.value.name = t('pets.validation.nameRequired')
    return
  }
  if (!newPet.value.species) {
    petErrors.value.species = t('pets.validation.speciesRequired')
    return
  }
  if (!newPet.value.breed) {
    petErrors.value.breed = t('pets.validation.breedRequired')
    return
  }
  if (!newPet.value.dateOfBirth) {
    petErrors.value.dateOfBirth = t('pets.validation.dateOfBirthRequired')
    return
  }
  
  submittingPet.value = true
  try {
    await ownersService.createPet(newPet.value)
    showNotification('success', t('dashboard.owner.petAddedSuccess'))
    showAddPetModal.value = false
    newPet.value = { name: '', species: '', breed: '', dateOfBirth: '' }
    await loadPets()
  } catch (error) {
    showNotification('error', t('dashboard.owner.petAddFailed'))
  } finally {
    submittingPet.value = false
  }
}

const submitProfile = async () => {
  profileErrors.value = {}

  const firstName = profileForm.value.firstName.trim()
  const lastName = profileForm.value.lastName.trim()
  const email = profileForm.value.email.trim().toLowerCase()

  if (!email) {
    profileErrors.value.email = t('dashboard.owner.validation.emailRequired')
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    profileErrors.value.email = t('dashboard.owner.validation.invalidEmail')
    return
  }

  if (firstName.length > 100) {
    profileErrors.value.firstName = t('dashboard.owner.validation.firstNameMax')
    return
  }

  if (lastName.length > 100) {
    profileErrors.value.lastName = t('dashboard.owner.validation.lastNameMax')
    return
  }

  submittingProfile.value = true
  try {
    const updatedOwner = await ownersService.updateMe({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined
    })

    owner.value = updatedOwner
    showEditProfile.value = false
    showNotification('success', t('dashboard.owner.profileUpdated'))

    try {
      await authStore.refreshAccessToken()
    } catch {
      // Owner details are already updated in local state, token refresh is best-effort.
    }
  } catch (error: any) {
    if (error?.response?.status === 409) {
      profileErrors.value.email = t('auth.emailTaken')
      return
    }

    showNotification('error', t('dashboard.owner.profileUpdateFailed'))
  } finally {
    submittingProfile.value = false
  }
}

const getPetSpeciesLabel = (pet: Pet) => {
  return translatePetSpecies(pet.species, t, pet.speciesLocalized)
}

const getPetBreedLabel = (pet: Pet) => {
  return translatePetBreed(pet.breed, t, pet.breedLocalized)
}

const formatDate = (date: string) => {
  if (!date) return t('common.notAvailable')
  try {
    return new Date(date).toLocaleDateString(undefined)
  } catch {
    return t('common.invalidDate')
  }
}

const petAge = (date: string) => {
  const birth = new Date(date)
  const now = new Date()
  const y = now.getFullYear() - birth.getFullYear()
  if (y <= 0) return t('pets.ageLessThanYear')

  const ageText = t('pets.ageYears', { count: y })
  if (ageText === 'pets.ageYears') {
    return t('pets.ageYearsOld', { count: y })
  }
  return ageText
}

const viewPetDetails = (pet: Pet) => {
  selectedPetForDetails.value = pet
  showPetDetailsModal.value = true
}

const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
  toastType.value = type
  toastMessage.value = message
  showToast.value = true
}
</script>
