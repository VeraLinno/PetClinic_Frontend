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
                Welcome back, {{ owner?.firstName || 'Owner' }}
              </h1>
              <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{{ owner?.email }}</p>
              <div class="mt-3 flex flex-wrap gap-3 text-sm">
                <div class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                  <HeartIcon class="h-4 w-4" aria-hidden="true" />
                  <span class="font-medium">{{ pets.length }}</span>
                  <span>Pets</span>
                </div>
                <div class="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-warning-700 dark:bg-warning-950/30 dark:text-warning-300">
                  <CalendarDaysIcon class="h-4 w-4" aria-hidden="true" />
                  <span class="font-medium">{{ upcomingAppointments }}</span>
                  <span>Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid w-full gap-2 sm:w-auto sm:grid-cols-2 md:grid-cols-1">
          <Button variant="primary" size="sm" @click="$router.push('/booking')">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            Book Appointment
          </Button>
          <Button variant="outline" size="sm" @click="openEditProfile">
            <PencilSquareIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            Edit Profile
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
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pets</p>
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
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Visits</p>
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
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ pendingAppointments }}</p>
        </div>
      </div>
    </div>

    <!-- Pets Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">My Pets</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Manage profiles and book care quickly</p>
          </div>
          <Button variant="primary" size="sm" @click="showAddPetModal = true">
            <PlusCircleIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            Add New Pet
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
        <p class="mt-2 text-gray-500 dark:text-gray-400">No pets found. Add your first pet to get started.</p>
        <Button variant="primary" class="mt-4" @click="showAddPetModal = true">Add Your First Pet</Button>
      </div>
      
      <!-- Pets Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PetCard
          v-for="pet in pets"
          :key="pet.id"
          :pet="pet"
          @book-appointment="bookAppointmentForPet"
          @delete-pet="confirmDeletePet"
        />
      </div>
    </Card>

    <!-- Appointments Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Stay on top of your scheduled visits</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="$router.push('/owner/history')">
              View History
            </Button>
            <Button variant="primary" size="sm" @click="$router.push('/booking')">
              Book New
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
    <Modal :is-open="showAddPetModal" title="Add New Pet" @close="showAddPetModal = false">
      <form @submit.prevent="submitPet" class="space-y-4">
        <Input
          v-model="newPet.name"
          label="Pet Name"
          placeholder="Enter pet name"
          required
          :error="petErrors.name"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Species</label>
            <select
              v-model="newPet.species"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary',
                petErrors.species ? 'border-danger-500 dark:border-danger-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              required
            >
              <option value="">Select species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Hamster">Hamster</option>
              <option value="Fish">Fish</option>
              <option value="Reptile">Reptile</option>
              <option value="Other">Other</option>
            </select>
            <p v-if="petErrors.species" class="mt-1 text-sm text-danger-600 dark:text-danger-400">{{ petErrors.species }}</p>
          </div>
          <Input
            v-model="newPet.breed"
            label="Breed"
            placeholder="Enter breed"
            required
            :error="petErrors.breed"
          />
        </div>
        <Input
          v-model="newPet.dateOfBirth"
          label="Date of Birth"
          type="date"
          required
          :error="petErrors.dateOfBirth"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showAddPetModal = false">Cancel</Button>
          <Button variant="primary" @click="submitPet" :disabled="submittingPet">
            {{ submittingPet ? 'Adding...' : 'Add Pet' }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" title="Delete Pet" @close="showDeleteModal = false">
      <p class="text-gray-600 dark:text-gray-400">
        Are you sure you want to delete <strong>{{ petToDelete?.name }}</strong>? This action cannot be undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDeleteModal = false">Cancel</Button>
          <Button variant="danger" @click="deletePet" :disabled="deletingPet">
            {{ deletingPet ? 'Deleting...' : 'Delete' }}
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Edit Profile Modal -->
    <Modal :is-open="showEditProfile" title="Edit Profile" @close="showEditProfile = false">
      <form @submit.prevent="submitProfile" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="profileForm.firstName"
            label="First Name"
            placeholder="Enter first name"
            :error="profileErrors.firstName"
          />
          <Input
            v-model="profileForm.lastName"
            label="Last Name"
            placeholder="Enter last name"
            :error="profileErrors.lastName"
          />
        </div>
        <Input
          v-model="profileForm.email"
          label="Email"
          type="email"
          placeholder="Enter email"
          required
          :error="profileErrors.email"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showEditProfile = false">Cancel</Button>
          <Button variant="primary" @click="submitProfile" :disabled="submittingProfile">
            {{ submittingProfile ? 'Saving...' : 'Save Changes' }}
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { appointmentsService, type Appointment } from '@/services/appointments'
import { ownersService, type Owner, type Pet } from '@/services/owners'
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
const petToDelete = ref<Pet | null>(null)

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

// Load data
onMounted(async () => {
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
  try {
    const data = await appointmentsService.getAppointments()
    appointments.value = filterAppointmentsToOwnedPets(data)
  } catch (error) {
    console.error('Failed to load appointments', error)
    showNotification('error', 'Failed to load appointments')
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
    showNotification('error', 'Failed to load pets')
  } finally {
    loadingPets.value = false
  }
}

const loadOwner = async () => {
  try {
    const data = await ownersService.getMe()
    owner.value = data
  } catch (error) {
    console.error('Failed to load owner', error)
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
    showNotification('success', 'Appointment cancelled successfully')
    await loadAppointments()
  } catch (error) {
    showNotification('error', 'Failed to cancel appointment')
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
    showNotification('success', 'Pet deleted successfully')
    showDeleteModal.value = false
    await loadPets()
  } catch (error) {
    showNotification('error', 'Failed to delete pet')
  } finally {
    deletingPet.value = false
  }
}

const submitPet = async () => {
  petErrors.value = {}
  
  if (!newPet.value.name) {
    petErrors.value.name = 'Pet name is required'
    return
  }
  if (!newPet.value.species) {
    petErrors.value.species = 'Species is required'
    return
  }
  if (!newPet.value.breed) {
    petErrors.value.breed = 'Breed is required'
    return
  }
  if (!newPet.value.dateOfBirth) {
    petErrors.value.dateOfBirth = 'Date of birth is required'
    return
  }
  
  submittingPet.value = true
  try {
    await ownersService.createPet(newPet.value)
    showNotification('success', 'Pet added successfully')
    showAddPetModal.value = false
    newPet.value = { name: '', species: '', breed: '', dateOfBirth: '' }
    await loadPets()
  } catch (error) {
    showNotification('error', 'Failed to add pet')
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
    profileErrors.value.email = 'Email is required'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    profileErrors.value.email = 'Please enter a valid email address'
    return
  }

  if (firstName.length > 100) {
    profileErrors.value.firstName = 'First name must be 100 characters or fewer'
    return
  }

  if (lastName.length > 100) {
    profileErrors.value.lastName = 'Last name must be 100 characters or fewer'
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
    showNotification('success', 'Profile updated successfully')

    try {
      await authStore.refreshAccessToken()
    } catch {
      // Owner details are already updated in local state, token refresh is best-effort.
    }
  } catch (error: any) {
    if (error?.response?.status === 409) {
      profileErrors.value.email = 'This email is already in use'
      return
    }

    showNotification('error', 'Failed to update profile')
  } finally {
    submittingProfile.value = false
  }
}

const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
  toastType.value = type
  toastMessage.value = message
  showToast.value = true
}
</script>
