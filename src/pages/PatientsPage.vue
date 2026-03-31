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
              <div class="flex gap-2 mt-2">
                <Button variant="outline" size="sm" @click="viewHistory(patient)">{{ $t('patients.history') }}</Button>
                <Button variant="primary" size="sm" @click="startVisit(patient)">{{ $t('dashboard.vet.startVisit') }}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface Patient {
  id: string
  name: string
  species: string
  breed: string
  ownerName: string
  lastVisit: string
}

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('patients.title') }
])

const patients = ref<Patient[]>([])
const loading = ref(true)
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
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
  router.push(`/owner/history?petId=${patient.id}`)
}

const startVisit = (patient: Patient) => {
  console.log('Start visit for', patient.name)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>
