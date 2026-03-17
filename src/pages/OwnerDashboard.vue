<template>
  <div class="space-y-6">
    <!-- Owner Profile Section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <!-- Avatar Skeleton -->
        <div class="flex-shrink-0">
          <div v-if="loadingOwner" class="skeleton w-24 h-24 rounded-full"></div>
          <div v-else class="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
            {{ ownerInitials }}
          </div>
        </div>
        
        <!-- Owner Info -->
        <div class="flex-1">
          <div v-if="loadingOwner" class="space-y-3">
            <div class="skeleton h-8 w-64 rounded"></div>
            <div class="skeleton h-4 w-48 rounded"></div>
            <div class="skeleton h-4 w-32 rounded"></div>
          </div>
          <div v-else>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {{ owner?.firstName || 'Owner' }}!
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ owner?.email }}</p>
            <div class="flex flex-wrap gap-4 mt-4">
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span class="font-medium text-gray-900 dark:text-white">{{ pets.length }}</span>
                <span class="ml-1">Pets</span>
              </div>
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-medium text-gray-900 dark:text-white">{{ upcomingAppointments }}</span>
                <span class="ml-1">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex flex-col gap-2">
          <Button variant="primary" size="sm" @click="$router.push('/booking')">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book Appointment
          </Button>
          <Button variant="outline" size="sm" @click="showEditProfile = true">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Pets Stat -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
        <div v-if="loadingPets" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-24 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pets</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pets.length }}</p>
          </div>
        </div>
      </div>
      
      <!-- Completed Visits Stat -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
        <div v-if="loadingAppointments" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-28 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Visits</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedVisits }}</p>
          </div>
        </div>
      </div>
      
      <!-- Pending Appointments Stat -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
        <div v-if="loadingAppointments" class="space-y-3">
          <div class="skeleton h-12 w-12 rounded-lg"></div>
          <div class="skeleton h-4 w-28 rounded"></div>
          <div class="skeleton h-8 w-16 rounded"></div>
        </div>
        <div v-else class="flex items-center">
          <div class="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingAppointments }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pets Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">My Pets</h2>
          <Button variant="primary" size="sm" @click="showAddPetModal = true">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
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
        />
      </div>
    </Card>

    <!-- Appointments Section -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
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
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
          </div>
          <Input
            v-model="newPet.breed"
            label="Breed"
            placeholder="Enter breed"
            required
          />
        </div>
        <Input
          v-model="newPet.dateOfBirth"
          label="Date of Birth"
          type="date"
          required
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

    <!-- Toast for notifications -->
    <Toast v-model:show="showToast" :type="toastType" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentsService, type Appointment } from '@/services/appointments'
import { ownersService, type Owner, type Pet } from '@/services/owners'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Toast from '@/components/ui/Toast.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import PetCard from '@/components/PetCard.vue'

const router = useRouter()

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
    loadAppointments(),
    loadPets(),
    loadOwner()
  ])
})

const loadAppointments = async () => {
  try {
    const data = await appointmentsService.getAppointments({ ownerId: 'me' })
    appointments.value = data
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
    petErrors.value.name = 'Species is required'
    return
  }
  if (!newPet.value.breed) {
    petErrors.value.name = 'Breed is required'
    return
  }
  if (!newPet.value.dateOfBirth) {
    petErrors.value.name = 'Date of birth is required'
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

const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
  toastType.value = type
  toastMessage.value = message
  showToast.value = true
}
</script>
