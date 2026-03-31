<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ $t('pets.title') }}</h1>
          <p class="mt-1 text-slate-500 dark:text-slate-400">{{ $t('pets.profilesSubtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
            {{ viewMode === 'grid' ? $t('pets.listView') : $t('pets.gridView') }}
          </Button>
          <Button variant="primary" @click="showAddModal = true">{{ $t('pets.addNew') }}</Button>
        </div>
      </div>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ $t('pets.profilesTitle') }}</h2>
          <Input v-model="search" :placeholder="$t('pets.searchPlaceholder')" class="w-full sm:w-72" />
        </div>
      </template>

      <div v-if="loading" class="py-8 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>

      <div v-else-if="filteredPets.length === 0" class="py-10 text-center text-slate-500 dark:text-slate-400">
        {{ $t('pets.noPetsFound') }}
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
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ getPetSpeciesLabel(pet) }} • {{ getPetBreedLabel(pet) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ $t('pets.age') }}: {{ petAge(pet.dateOfBirth) }}</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button variant="outline" size="sm" class="flex-1" @click="openDetails(pet)">{{ $t('common.details') }}</Button>
            <Button variant="primary" size="sm" class="flex-1" @click="bookForPet(pet)">{{ $t('dashboard.owner.bookAppointment') }}</Button>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">{{ $t('pets.name') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">{{ $t('pets.type') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">{{ $t('pets.breed') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">{{ $t('pets.age') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pet in filteredPets" :key="`${pet.id}-row`" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{{ pet.name }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ getPetSpeciesLabel(pet) }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ getPetBreedLabel(pet) }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ petAge(pet.dateOfBirth) }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="openDetails(pet)">{{ $t('common.details') }}</Button>
                  <Button variant="primary" size="sm" @click="bookForPet(pet)">{{ $t('dashboard.owner.bookAppointment') }}</Button>
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
            <p class="text-slate-500">{{ $t('pets.type') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ getPetSpeciesLabel(selectedPet) }}</p>
          </div>
          <div>
            <p class="text-slate-500">{{ $t('pets.breed') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ getPetBreedLabel(selectedPet) }}</p>
          </div>
          <div>
            <p class="text-slate-500">{{ $t('pets.dateOfBirth') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ formatDate(selectedPet.dateOfBirth) }}</p>
          </div>
          <div>
            <p class="text-slate-500">{{ $t('pets.age') }}</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ petAge(selectedPet.dateOfBirth) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showDetailsModal = false">{{ $t('common.close') }}</Button>
          <Button variant="primary" @click="bookForPet(selectedPet!)">{{ $t('dashboard.owner.bookAppointment') }}</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showAddModal" :title="$t('dashboard.owner.addPetModalTitle')" @close="showAddModal = false">
      <div class="space-y-4">
        <div v-if="addPetError" class="rounded-lg border border-danger-300 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">{{ addPetError }}</div>
        <Input v-model="newPet.name" :label="$t('pets.name')" />
        <Input v-model="newPet.species" :label="$t('pets.type')" />
        <Input v-model="newPet.breed" :label="$t('pets.breed')" />
        <Input v-model="newPet.dateOfBirth" type="date" :label="$t('pets.dateOfBirth')" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showAddModal = false">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" @click="addPet">{{ $t('dashboard.owner.addPet') }}</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ownersService, type Pet } from '@/services/owners'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const breadcrumbItems = computed(() => [{ label: t('pets.title') }])

const pets = ref<Pet[]>([])
const loading = ref(true)
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
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

watch(
  () => route.query.search,
  (value) => {
    const queryValue = typeof value === 'string' ? value : ''
    if (queryValue !== search.value) {
      search.value = queryValue
    }
  }
)

watch(search, (value) => {
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
  const s = species.toLowerCase()
  if (s.includes('dog')) return '🐕'
  if (s.includes('cat')) return '🐱'
  if (s.includes('bird')) return '🐦'
  return '🐾'
}

const normalizeTranslationKey = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const getPetSpeciesLabel = (pet: Pet) => {
  if (pet.speciesLocalized) {
    return pet.speciesLocalized
  }

  const key = `pets.species_${normalizeTranslationKey(pet.species)}`
  const translated = t(key)
  return translated === key ? pet.species : translated
}

const getPetBreedLabel = (pet: Pet) => {
  if (pet.breedLocalized) {
    return pet.breedLocalized
  }

  const key = `pets.breed_${normalizeTranslationKey(pet.breed)}`
  const translated = t(key)
  return translated === key ? pet.breed : translated
}

const formatDate = (date: string) => new Date(date).toLocaleDateString(locale.value || undefined)

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
    const message = error.response?.data?.message || t('dashboard.owner.petAddFailed')
    console.error('Error adding pet:', error)
    addPetError.value = message
  }
}
</script>
