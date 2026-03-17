<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your patient records</p>
    </div>

    <!-- Search & Filters -->
    <Card>
      <template #header>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">All Patients</h2>
          <div class="flex gap-2 w-full md:w-auto">
            <Input
              v-model="searchQuery"
              placeholder="Search by name or owner..."
              class="w-full md:w-64"
            />
            <select
              v-model="speciesFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
            </select>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-else-if="filteredPatients.length === 0" class="text-center py-8 text-gray-500">
        No patients found.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="patient in filteredPatients"
          :key="patient.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {{ getPetEmoji(patient.species) }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ patient.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ patient.species }} - {{ patient.breed }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Owner: {{ patient.ownerName }}</p>
              <div class="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" @click="viewHistory(patient)">History</Button>
                <Button variant="primary" size="sm" @click="startVisit(patient)">New Visit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

interface Patient {
  id: string
  name: string
  species: string
  breed: string
  ownerName: string
  lastVisit: string
}

const router = useRouter()
const patients = ref<Patient[]>([])
const loading = ref(true)
const searchQuery = ref('')
const speciesFilter = ref('')

const filteredPatients = computed(() => {
  return patients.value.filter(patient => {
    const matchesSearch = !searchQuery.value || 
      patient.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSpecies = !speciesFilter.value || patient.species === speciesFilter.value
    return matchesSearch && matchesSpecies
  })
})

onMounted(() => {
  // Mock data
  patients.value = [
    { id: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', ownerName: 'John Smith', lastVisit: '2024-02-15' },
    { id: '2', name: 'Whiskers', species: 'Cat', breed: 'Persian', ownerName: 'Jane Doe', lastVisit: '2024-02-10' },
    { id: '3', name: 'Max', species: 'Dog', breed: 'German Shepherd', ownerName: 'Bob Wilson', lastVisit: '2024-02-20' },
    { id: '4', name: 'Tweety', species: 'Bird', breed: 'Canary', ownerName: 'Alice Brown', lastVisit: '2024-01-28' }
  ]
  loading.value = false
})

const getPetEmoji = (species: string) => {
  if (species.toLowerCase() === 'dog') return '🐕'
  if (species.toLowerCase() === 'cat') return '🐱'
  if (species.toLowerCase() === 'bird') return '🐦'
  return '🐾'
}

const viewHistory = (patient: Patient) => {
  router.push(`/owner/history?petId=${patient.id}`)
}

const startVisit = (patient: Patient) => {
  console.log('Start visit for', patient.name)
}
</script>
