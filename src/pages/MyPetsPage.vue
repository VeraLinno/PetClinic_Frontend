<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">My Pets</h1>
          <p class="mt-1 text-slate-500 dark:text-slate-400">Manage all pet profiles in one place.</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
            {{ viewMode === 'grid' ? 'List View' : 'Grid View' }}
          </Button>
          <Button variant="primary" @click="showAddModal = true">Add New Pet</Button>
        </div>
      </div>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Pet Profiles</h2>
          <Input v-model="search" placeholder="Search by pet name or breed..." class="w-full sm:w-72" />
        </div>
      </template>

      <div v-if="loading" class="py-8 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>

      <div v-else-if="filteredPets.length === 0" class="py-10 text-center text-slate-500 dark:text-slate-400">
        No pets found.
      </div>

      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="pet in filteredPets"
          :key="pet.id"
          class="rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-card-hover dark:border-slate-700"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl dark:bg-primary-900/30">
              {{ getPetEmoji(pet.species) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="truncate font-semibold text-slate-900 dark:text-slate-100">{{ pet.name }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ pet.species }} • {{ pet.breed }}</p>
              <p class="mt-1 text-xs text-slate-400">Age: {{ petAge(pet.dateOfBirth) }}</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button variant="outline" size="sm" class="flex-1" @click="openDetails(pet)">Details</Button>
            <Button variant="primary" size="sm" class="flex-1" @click="bookForPet(pet)">Book</Button>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Species</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Breed</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Age</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pet in filteredPets" :key="`${pet.id}-row`" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{{ pet.name }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ pet.species }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ pet.breed }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ petAge(pet.dateOfBirth) }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="openDetails(pet)">Details</Button>
                  <Button variant="primary" size="sm" @click="bookForPet(pet)">Book</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Modal :is-open="showDetailsModal" :title="selectedPet?.name" @close="showDetailsModal = false">
      <div v-if="selectedPet" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-slate-500">Species</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ selectedPet.species }}</p>
          </div>
          <div>
            <p class="text-slate-500">Breed</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ selectedPet.breed }}</p>
          </div>
          <div>
            <p class="text-slate-500">Date of Birth</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatDate(selectedPet.dateOfBirth) }}</p>
          </div>
          <div>
            <p class="text-slate-500">Age</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ petAge(selectedPet.dateOfBirth) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showDetailsModal = false">Close</Button>
          <Button variant="primary" @click="bookForPet(selectedPet!)">Book Appointment</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showAddModal" title="Add New Pet" @close="showAddModal = false">
      <div class="space-y-4">
        <div v-if="addPetError" class="rounded-lg border border-danger-300 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">{{ addPetError }}</div>
        <Input v-model="newPet.name" label="Pet Name" />
        <Input v-model="newPet.species" label="Species" />
        <Input v-model="newPet.breed" label="Breed" />
        <Input v-model="newPet.dateOfBirth" type="date" label="Date of Birth" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showAddModal = false">Cancel</Button>
          <Button variant="primary" @click="addPet">Add Pet</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ownersService, type Pet } from '@/services/owners'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()
const breadcrumbItems = [{ label: 'My Pets' }]

const pets = ref<Pet[]>([])
const loading = ref(true)
const search = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

const showDetailsModal = ref(false)
const showAddModal = ref(false)
const selectedPet = ref<Pet | null>(null)
const addPetError = ref('')

const newPet = ref({
  name: '',
  species: '',
  breed: '',
  dateOfBirth: ''
})

const filteredPets = computed(() => {
  if (!search.value) return pets.value
  const q = search.value.toLowerCase()
  return pets.value.filter((pet) => pet.name.toLowerCase().includes(q) || pet.breed.toLowerCase().includes(q))
})

onMounted(async () => {
  try {
    pets.value = await ownersService.getPets()
  } finally {
    loading.value = false
  }
})

const getPetEmoji = (species: string) => {
  const s = species.toLowerCase()
  if (s.includes('dog')) return '🐕'
  if (s.includes('cat')) return '🐱'
  if (s.includes('bird')) return '🐦'
  return '🐾'
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const petAge = (date: string) => {
  const birth = new Date(date)
  const now = new Date()
  const y = now.getFullYear() - birth.getFullYear()
  return y <= 0 ? 'Less than 1 year' : `${y} years`
}

const openDetails = (pet: Pet) => {
  selectedPet.value = pet
  showDetailsModal.value = true
}

const bookForPet = (pet: Pet) => {
  sessionStorage.setItem('selectedPet', JSON.stringify(pet))
  router.push('/booking')
}

const addPet = async () => {
  if (!newPet.value.name || !newPet.value.species || !newPet.value.breed || !newPet.value.dateOfBirth) return
  addPetError.value = ''
  try {
    const created = await ownersService.createPet(newPet.value)
    pets.value.push(created)
    newPet.value = { name: '', species: '', breed: '', dateOfBirth: '' }
    showAddModal.value = false
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to add pet. Please try again.'
    console.error('Error adding pet:', error)
    addPetError.value = message
  }
}
</script>
