<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Visit History</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">View your pet's past visits and medical records</p>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Filter Visits</h2>
          <div class="flex flex-wrap gap-2">
            <select
              v-model="filters.petId"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Pets</option>
              <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
            </select>
            <Input
              v-model="filters.startDate"
              type="date"
              placeholder="Start Date"
              class="w-40"
            />
            <Input
              v-model="filters.endDate"
              type="date"
              placeholder="End Date"
              class="w-40"
            />
            <Button variant="outline" @click="applyFilters">Apply</Button>
            <Button variant="ghost" @click="clearFilters">Clear</Button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Loading visits...</p>
      </div>

      <div v-else-if="filteredVisits.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-gray-500 dark:text-gray-400">No visits found for the selected filters.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="visit in filteredVisits"
          :key="visit.id"
          class="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ getPetEmoji(visit.petName) }}</span>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ visit.petName }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDateLong(visit.date) }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <Badge v-if="visit.diagnosis" variant="info" size="sm">{{ visit.diagnosis }}</Badge>
                <Badge v-for="treatment in visit.treatments" :key="treatment" variant="default" size="sm">
                  {{ treatment }}
                </Badge>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Dr. {{ visit.vetName }}</p>
                <Badge :variant="visit.invoiceStatus === 'Paid' ? 'success' : 'warning'" size="sm">
                  {{ visit.invoiceStatus || 'Pending' }}
                </Badge>
              </div>
              <Button variant="outline" size="sm" @click="viewDetails(visit)">Details</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Modal :is-open="showDetailsModal" :title="selectedVisit?.petName" @close="showDetailsModal = false">
      <div v-if="selectedVisit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
            <p class="text-gray-900 dark:text-white">{{ formatDateLong(selectedVisit.date) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Veterinarian</label>
            <p class="text-gray-900 dark:text-white">Dr. {{ selectedVisit.vetName }}</p>
          </div>
          <div v-if="selectedVisit.diagnosis">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</label>
            <p class="text-gray-900 dark:text-white">{{ selectedVisit.diagnosis }}</p>
          </div>
          <div v-if="selectedVisit.treatments?.length">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Treatments</label>
            <ul class="list-disc list-inside text-gray-900 dark:text-white">
              <li v-for="t in selectedVisit.treatments" :key="t">{{ t }}</li>
            </ul>
          </div>
          <div v-if="selectedVisit.prescriptions?.length">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Prescriptions</label>
            <ul class="list-disc list-inside text-gray-900 dark:text-white">
              <li v-for="p in selectedVisit.prescriptions" :key="p.medication">
                {{ p.medication }} - {{ p.dosage }}
              </li>
            </ul>
          </div>
          <div v-if="selectedVisit.invoiceTotal">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Total</label>
            <p class="text-gray-900 dark:text-white">${{ selectedVisit.invoiceTotal }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showDetailsModal = false">Close</Button>
          <Button v-if="selectedVisit?.invoiceStatus !== 'Paid'" variant="primary" @click="payInvoice">
            Pay Invoice
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ownersService, type Pet } from '@/services/owners'
import { appointmentsService } from '@/services/appointments'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const breadcrumbItems = [
  { label: 'Visit History' }
]

const route = useRoute()
const router = useRouter()

interface Visit {
  id: string
  petId: string
  petName: string
  date: string
  vetName: string
  diagnosis?: string
  treatments?: string[]
  prescriptions?: Array<{ medication: string; dosage: string }>
  invoiceTotal?: number
  invoiceStatus?: string
}

const pets = ref<Pet[]>([])
const visits = ref<Visit[]>([])
const loading = ref(true)
const showDetailsModal = ref(false)
const selectedVisit = ref<Visit | null>(null)

const filters = ref({
  petId: route.query.petId as string || '',
  startDate: '',
  endDate: ''
})

const filteredVisits = computed(() => {
  return visits.value.filter(visit => {
    if (filters.value.petId && visit.petId !== filters.value.petId) return false
    if (filters.value.startDate && new Date(visit.date) < new Date(filters.value.startDate)) return false
    if (filters.value.endDate && new Date(visit.date) > new Date(filters.value.endDate)) return false
    return true
  })
})

onMounted(async () => {
  await loadPets()
  await loadVisits()
})

const loadPets = async () => {
  try {
    const data = await ownersService.getPets()
    pets.value = data
  } catch (error) {
    console.error('Failed to load pets', error)
  }
}

const loadVisits = async () => {
  loading.value = true
  try {
    const ownerPets = pets.value
    const ownedPetIds = new Set(ownerPets.map((pet) => pet.id))
    const petNameById = new Map(ownerPets.map((pet) => [pet.id, pet.name]))

    const appointments = await appointmentsService.getAppointments()
    visits.value = appointments
      .filter((appointment: any) => ownedPetIds.has(appointment.petId))
      .map((appointment: any) => ({
        id: appointment.id,
        petId: appointment.petId,
        petName: petNameById.get(appointment.petId) || 'Unknown Pet',
        date: appointment.startAt || appointment.dateTime,
        vetName: appointment.veterinarianName || 'Assigned Vet',
        invoiceStatus: 'Pending'
      }))
  } catch (error) {
    console.error('Failed to load visits', error)
  } finally {
    loading.value = false
  }
}

const getPetEmoji = (petName: string) => {
  return '🐾'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatDateLong = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const applyFilters = () => {
  // Filters are applied via computed property
}

const clearFilters = () => {
  filters.value = { petId: '', startDate: '', endDate: '' }
}

const viewDetails = (visit: Visit) => {
  selectedVisit.value = visit
  showDetailsModal.value = true
}

const payInvoice = () => {
  // TODO: Implement invoice payment
  console.log('Pay invoice for', selectedVisit.value?.id)
}
</script>
