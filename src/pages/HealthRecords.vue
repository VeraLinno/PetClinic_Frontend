<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Health Records</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">View and manage your pets' health information</p>
    </div>

    <!-- Pet Selection -->
    <Card v-if="pets.length > 0">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Select Pet</h2>
      </template>
      <div class="flex gap-4 overflow-x-auto pb-2">
        <button
          v-for="pet in pets"
          :key="pet.id"
          @click="selectPet(pet)"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-colors',
            selectedPet?.id === pet.id 
              ? 'border-primary bg-blue-50 dark:bg-blue-900/30' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          ]"
        >
          <span class="text-2xl mr-2">{{ getPetEmoji(pet) }}</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ pet.name }}</span>
        </button>
      </div>
    </Card>

    <!-- Health Records -->
    <Card v-if="selectedPet">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Health Records - {{ selectedPet.name }}
          </h2>
          <Badge variant="success">{{ petAge(selectedPet.dateOfBirth) }}</Badge>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Vaccinations -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Vaccinations</h3>
          <div class="space-y-2">
            <div
              v-for="vax in vaccinations"
              :key="vax.id"
              class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ vax.name }}</p>
                <p class="text-sm text-gray-500">Given: {{ formatDate(vax.date) }}</p>
              </div>
              <Badge variant="success">Up to date</Badge>
            </div>
          </div>
        </div>

        <!-- Allergies -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Allergies</h3>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="allergy in allergies" :key="allergy" variant="danger">
              {{ allergy }}
            </Badge>
            <span v-if="allergies.length === 0" class="text-gray-500">No known allergies</span>
          </div>
        </div>

        <!-- Medical Notes -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Medical Notes</h3>
          <div class="space-y-2">
            <div
              v-for="note in medicalNotes"
              :key="note.id"
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p class="text-gray-900 dark:text-white">{{ note.content }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(note.date) }} - Dr. {{ note.vet }}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <div v-else-if="!loading && pets.length === 0" class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">No pets found. Add a pet to view health records.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ownersService, type Pet } from '@/services/owners'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

const pets = ref<Pet[]>([])
const selectedPet = ref<Pet | null>(null)
const loading = ref(true)

const vaccinations = ref([
  { id: '1', name: 'Rabies', date: '2024-01-15' },
  { id: '2', name: 'DHPP', date: '2024-02-01' }
])

const allergies = ref(['Chicken', 'Some antibiotics'])

const medicalNotes = ref([
  { id: '1', content: 'Annual checkup - healthy weight', date: '2024-01-15', vet: 'Smith' },
  { id: '2', content: 'Mild ear infection - follow up in 2 weeks', date: '2023-11-20', vet: 'Johnson' }
])

onMounted(async () => {
  try {
    const data = await ownersService.getPets()
    pets.value = data
    if (data.length > 0) {
      selectedPet.value = data[0]
    }
  } catch (error) {
    console.error('Failed to load pets', error)
  } finally {
    loading.value = false
  }
})

const selectPet = (pet: Pet) => {
  selectedPet.value = pet
}

const getPetEmoji = (pet: Pet) => {
  const species = pet.species.toLowerCase()
  if (species.includes('dog')) return '🐕'
  if (species.includes('cat')) return '🐱'
  return '🐾'
}

const petAge = (dateOfBirth: string) => {
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  return years > 0 ? `${years} years old` : 'Less than 1 year'
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()
</script>
