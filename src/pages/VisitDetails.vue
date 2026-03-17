<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Visit Details</h1>
      <Button variant="secondary" @click="$router.go(-1)">
        Back
      </Button>
    </div>

    <!-- Pet Information -->
    <Card v-if="pet">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Pet Information</h2>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <strong>Name:</strong> {{ pet.name }}
        </div>
        <div>
          <strong>Species:</strong> {{ pet.species }}
        </div>
        <div>
          <strong>Breed:</strong> {{ pet.breed }}
        </div>
        <div>
          <strong>Date of Birth:</strong> {{ formatDate(pet.dateOfBirth) }}
        </div>
      </div>
    </Card>

    <!-- Visit Notes -->
    <Card>
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Visit Notes</h2>
      </template>
      <div v-if="canEdit">
        <textarea
          v-model="visitNotes"
          rows="4"
          class="w-full border border-gray-300 rounded-md p-3"
          placeholder="Enter visit notes..."
        />
      </div>
      <div v-else>
        <p v-if="visitNotes" class="text-gray-700">{{ visitNotes }}</p>
        <p v-else class="text-gray-500">No notes recorded yet.</p>
      </div>
    </Card>

    <!-- Treatments -->
    <Card v-if="canEdit">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900">Treatments</h2>
          <Button variant="primary" size="sm" @click="addTreatment">
            Add Treatment
          </Button>
        </div>
      </template>
      <div v-if="treatments.length === 0" class="text-gray-500">
        No treatments added yet.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(treatment, index) in treatments"
          :key="index"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <strong>{{ treatment.name }}</strong> - {{ treatment.description }}
          </div>
          <Button variant="danger" size="sm" @click="removeTreatment(index)">
            Remove
          </Button>
        </div>
      </div>
    </Card>

    <!-- Prescriptions -->
    <Card v-if="canEdit">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900">Prescriptions</h2>
          <Button variant="primary" size="sm" @click="addPrescription">
            Add Prescription
          </Button>
        </div>
      </template>
      <div v-if="prescriptions.length === 0" class="text-gray-500">
        No prescriptions added yet.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(prescription, index) in prescriptions"
          :key="index"
          class="p-3 bg-gray-50 rounded-lg"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div><strong>Medication:</strong> {{ prescription.medication }}</div>
            <div><strong>Dosage:</strong> {{ prescription.dosage }}</div>
            <div><strong>Quantity:</strong> {{ prescription.quantity }}</div>
          </div>
          <Button variant="danger" size="sm" class="mt-2" @click="removePrescription(index)">
            Remove
          </Button>
        </div>
      </div>
    </Card>

    <!-- Invoice -->
    <Card v-if="visit?.invoice">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Invoice</h2>
      </template>
      <div class="bg-gray-50 p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(visit.invoice, null, 2) }}</pre>
      </div>
    </Card>

    <!-- Actions -->
    <div class="flex justify-end space-x-4" v-if="canEdit && !visit?.invoice">
      <Button variant="success" @click="completeVisit" :disabled="completing">
        {{ completing ? 'Completing...' : 'Complete Visit' }}
      </Button>
    </div>

    <!-- Modals -->
    <Modal :is-open="showTreatmentModal" @close="showTreatmentModal = false">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Add Treatment</h3>
      </template>
      <div class="space-y-4">
        <Input
          label="Treatment Name"
          v-model="newTreatment.name"
          placeholder="e.g., Vaccination"
        />
        <Input
          label="Description"
          v-model="newTreatment.description"
          placeholder="Treatment details..."
        />
      </div>
      <template #footer>
        <Button variant="secondary" @click="showTreatmentModal = false">
          Cancel
        </Button>
        <Button variant="primary" @click="saveTreatment">
          Add Treatment
        </Button>
      </template>
    </Modal>

    <Modal :is-open="showPrescriptionModal" @close="showPrescriptionModal = false">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Add Prescription</h3>
      </template>
      <div class="space-y-4">
        <Input
          label="Medication"
          v-model="newPrescription.medication"
          placeholder="e.g., Amoxicillin"
        />
        <Input
          label="Dosage"
          v-model="newPrescription.dosage"
          placeholder="e.g., 500mg"
        />
        <Input
          label="Quantity"
          v-model="newPrescription.quantity"
          type="number"
          placeholder="e.g., 30"
        />
      </div>
      <template #footer>
        <Button variant="secondary" @click="showPrescriptionModal = false">
          Cancel
        </Button>
        <Button variant="primary" @click="savePrescription">
          Add Prescription
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { appointmentsService, type Visit, type Prescription } from '@/services/appointments'
import { ownersService, type Pet } from '@/services/owners'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'

const route = useRoute()
const authStore = useAuthStore()

const visit = ref<Visit | null>(null)
const pet = ref<Pet | null>(null)
const loading = ref(true)
const completing = ref(false)

const visitNotes = ref('')
const treatments = ref<Array<{ name: string; description: string }>>([])
const prescriptions = ref<Prescription[]>([])

const showTreatmentModal = ref(false)
const showPrescriptionModal = ref(false)
const newTreatment = ref({ name: '', description: '' })
const newPrescription = ref({ medication: '', dosage: '', quantity: '' })

const visitId = route.params.id as string

const canEdit = computed(() => authStore.roles.includes('Vet'))
const canComplete = computed(() => authStore.roles.includes('Vet') && !visit.value?.invoice)

onMounted(async () => {
  await loadVisit()
  await loadPet()
})

const loadVisit = async () => {
  try {
    visit.value = await appointmentsService.getVisit(visitId)
    if (visit.value) {
      visitNotes.value = visit.value.notes || ''
      // TODO: Load treatments and prescriptions from visit data
    }
  } catch (error) {
    console.error('Failed to load visit', error)
  } finally {
    loading.value = false
  }
}

const loadPet = async () => {
  // TODO: Get pet from appointment data
  // For now, mock pet data
  pet.value = {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    dateOfBirth: '2020-01-01',
    ownerId: 'owner1'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const addTreatment = () => {
  newTreatment.value = { name: '', description: '' }
  showTreatmentModal.value = true
}

const saveTreatment = () => {
  if (newTreatment.value.name && newTreatment.value.description) {
    treatments.value.push({ ...newTreatment.value })
    showTreatmentModal.value = false
  }
}

const removeTreatment = (index: number) => {
  treatments.value.splice(index, 1)
}

const addPrescription = () => {
  newPrescription.value = { medication: '', dosage: '', quantity: '' }
  showPrescriptionModal.value = true
}

const savePrescription = () => {
  const quantity = parseInt(newPrescription.value.quantity)
  if (newPrescription.value.medication && newPrescription.value.dosage && quantity > 0) {
    prescriptions.value.push({
      medication: newPrescription.value.medication,
      dosage: newPrescription.value.dosage,
      quantity: quantity
    })
    showPrescriptionModal.value = false
  }
}

const removePrescription = (index: number) => {
  prescriptions.value.splice(index, 1)
}

const completeVisit = async () => {
  if (!visit.value) return
  completing.value = true
  try {
    await appointmentsService.completeVisit(visitId, {
      notes: visitNotes.value,
      prescriptions: prescriptions.value
    })
    // Reload visit to get invoice
    await loadVisit()
  } catch (error) {
    console.error('Failed to complete visit', error)
  } finally {
    completing.value = false
  }
}
</script>