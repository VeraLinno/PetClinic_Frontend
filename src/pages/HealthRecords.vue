<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('health.recordsTitle') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ $t('health.recordsSubtitle') }}</p>
    </div>

    <Card v-if="pets.length > 0">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('health.petRecords') }}</h2>
      </template>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <button
          v-for="pet in pets"
          :key="pet.id"
          @click="selectPet(pet)"
          :class="[
            'flex-shrink-0 rounded-lg border-2 px-4 py-2 transition-colors',
            selectedPet?.id === pet.id 
              ? 'border-primary bg-primary-50 text-primary-800 dark:bg-primary-950/30 dark:text-primary-300' 
              : 'border-gray-200 text-slate-700 dark:border-gray-700 dark:text-slate-300 hover:border-gray-300'
          ]"
        >
          <span class="mr-2 text-2xl">{{ getPetEmoji(pet) }}</span>
          <span class="font-medium">{{ pet.name }}</span>
        </button>
      </div>
    </Card>

    <Card v-if="selectedPet">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('health.recordsForPet', { name: selectedPet.name }) }}
          </h2>
          <Badge variant="success">{{ petAge(selectedPet.dateOfBirth) }}</Badge>
        </div>
      </template>

      <div class="space-y-8">
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('health.vaccinations') }}</h3>
            <Button variant="outline" size="sm">{{ $t('health.addVaccination') }}</Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="vax in vaccinations"
              :key="vax.id"
              class="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2.5 w-2.5 rounded-full bg-success-500" aria-hidden="true" />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ vax.name }}</p>
                  <p class="text-sm text-gray-500">{{ $t('health.given') }}: {{ formatDate(vax.date) }}</p>
                  <p class="text-xs text-slate-400">{{ $t('health.nextDueShort') }}: {{ nextDueDate(vax.date) }}</p>
                </div>
              </div>
              <Badge :variant="isDueSoon(vax.date) ? 'warning' : 'success'">{{ isDueSoon(vax.date) ? $t('health.dueSoon') : $t('health.upToDate') }}</Badge>
            </div>
          </div>

          <div class="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="min-w-full">
              <thead class="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.vaccine') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.lastGiven') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.nextDue') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('invoices.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vax in vaccinations" :key="`${vax.id}-row`" class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">{{ vax.name }}</td>
                  <td class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{{ formatDate(vax.date) }}</td>
                  <td class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{{ nextDueDate(vax.date) }}</td>
                  <td class="px-4 py-2">
                    <Badge :variant="isDueSoon(vax.date) ? 'warning' : 'success'" size="sm">{{ isDueSoon(vax.date) ? $t('health.dueSoon') : $t('health.current') }}</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">{{ $t('health.medicalConditions') }}</h3>
          <div class="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <Badge v-for="allergy in allergies" :key="allergy" variant="danger">
              {{ allergy }}
            </Badge>
            <span v-if="allergies.length === 0" class="text-gray-500">{{ $t('health.noAllergies') }}</span>
          </div>
        </div>

        <div>
          <h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">{{ $t('health.medications') }}</h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="min-w-full">
              <thead class="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.medication') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.dosage') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('health.frequency') }}</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">{{ $t('invoices.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="med in medications" :key="med.id" class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">{{ med.name }}</td>
                  <td class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{{ med.dosage }}</td>
                  <td class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{{ med.frequency }}</td>
                  <td class="px-4 py-2"><Badge :variant="med.active ? 'success' : 'default'" size="sm">{{ med.active ? $t('health.active') : $t('health.inactive') }}</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">{{ $t('health.medicalNotes') }}</h3>
          <div class="space-y-2">
            <div
              v-for="note in medicalNotes"
              :key="note.id"
              class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
            >
              <p class="text-gray-900 dark:text-white">{{ note.content }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(note.date) }} - Dr. {{ note.vet }}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <div v-else-if="!loading && pets.length === 0" class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">{{ $t('health.noPetsHealth') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ownersService, type Pet } from '@/services/owners'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Button from '@/components/ui/Button.vue'

const { t, locale } = useI18n()
const breadcrumbItems = computed(() => [{ label: t('health.recordsTitle') }])

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

const medications = ref([
  { id: '1', name: 'Heartworm Prevention', dosage: '1 tablet', frequency: 'Monthly', active: true },
  { id: '2', name: 'Omega Supplement', dosage: '2 ml', frequency: 'Daily', active: false }
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
  return years > 0 ? t('pets.ageYearsOld', { count: years }) : t('pets.ageLessThanYear')
}

const formatDate = (date: string) => new Date(date).toLocaleDateString(locale.value || undefined)

const nextDueDate = (date: string) => {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + 1)
  return d.toLocaleDateString(locale.value || undefined)
}

const isDueSoon = (date: string) => {
  const due = new Date(date)
  due.setFullYear(due.getFullYear() + 1)
  const now = new Date()
  const in60 = new Date()
  in60.setDate(in60.getDate() + 60)
  return due >= now && due <= in60
}
</script>
