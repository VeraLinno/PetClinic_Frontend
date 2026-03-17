<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Progress Indicator -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <div class="flex items-center space-x-2">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep > Number(index) ? 'bg-green-500 text-white' : currentStep === Number(index) ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              ]"
            >
              {{ Number(index) + 1 }}
            </div>
            <span
              :class="[
                'ml-2 text-sm font-medium',
                currentStep >= Number(index) ? 'text-gray-900' : 'text-gray-500'
              ]"
            >
              {{ step.title }}
            </span>
            <div
              v-if="Number(index) < steps.length - 1"
              :class="[
                'w-8 h-0.5 mx-4',
                currentStep > Number(index) ? 'bg-green-500' : 'bg-gray-300'
              ]"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <Card>
      <div class="p-6">
        <!-- Step 1: Select Pet -->
        <div v-if="currentStep === 0">
          <h2 class="text-xl font-semibold mb-4">Select a Pet</h2>
          <div v-if="pets.length === 0" class="text-center py-8 text-gray-500">
            No pets available. Please add a pet first.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="pet in pets"
              :key="pet.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-colors',
                selectedPet?.id === pet.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              ]"
              @click="selectPet(pet)"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getPetEmoji(pet) }}</span>
                <div>
                  <h3 class="font-medium">{{ pet.name }}</h3>
                  <p class="text-sm text-gray-600">{{ pet.species }} • {{ pet.breed }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Select Date -->
        <div v-if="currentStep === 1">
          <h2 class="text-xl font-semibold mb-4">Select Date</h2>
          <Input
            label="Appointment Date"
            type="date"
            v-model="selectedDate"
            :min="minDate"
            required
          />
        </div>

        <!-- Step 3: Select Time Slot -->
        <div v-if="currentStep === 2">
          <h2 class="text-xl font-semibold mb-4">Select Time Slot</h2>
          <div v-if="loadingSlots" class="text-center py-8">Loading available slots...</div>
          <div v-else-if="availableSlots.length === 0" class="text-center py-8 text-gray-500">
            No available slots for this date.
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              v-for="slot in availableSlots"
              :key="slot"
              :class="[
                'p-4 border rounded-lg text-center hover:border-blue-500 transition-colors',
                selectedTime === slot ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              ]"
              @click="selectTime(slot)"
            >
              {{ formatTime(slot) }}
            </button>
          </div>
        </div>

        <!-- Step 4: Confirm Booking -->
        <div v-if="currentStep === 3">
          <h2 class="text-xl font-semibold mb-4">Confirm Booking</h2>
          <div class="space-y-4">
            <div>
              <strong>Pet:</strong> {{ selectedPet?.name }}
            </div>
            <div>
              <strong>Date:</strong> {{ formatDate(selectedDate) }}
            </div>
            <div>
              <strong>Time:</strong> {{ formatTime(selectedTime) }}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                v-model="notes"
                rows="3"
                class="w-full border border-gray-300 rounded-md p-2"
                placeholder="Any special notes for the appointment..."
              />
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between mt-8">
          <Button
            variant="secondary"
            @click="previousStep"
            :disabled="currentStep === 0"
          >
            Previous
          </Button>
          <div class="space-x-2">
            <Button variant="secondary" @click="$router.push('/owner')">
              Cancel
            </Button>
            <Button
              v-if="currentStep < steps.length - 1"
              variant="primary"
              @click="nextStep"
              :disabled="!canProceed"
            >
              Next
            </Button>
            <Button
              v-else
              variant="success"
              @click="confirmBooking"
              :disabled="loading"
            >
              {{ loading ? 'Booking...' : 'Confirm Booking' }}
            </Button>
          </div>
        </div>

        <div v-if="error" class="mt-4 text-red-500 text-center">
          {{ error }}
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentsService } from '@/services/appointments'
import { ownersService, type Pet } from '@/services/owners'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const router = useRouter()

// Wizard state
const currentStep = ref(0)
const steps = [
  { id: 'pet', title: 'Select Pet' },
  { id: 'date', title: 'Select Date' },
  { id: 'time', title: 'Select Time' },
  { id: 'confirm', title: 'Confirm' }
]

// Data
const pets = ref<Pet[]>([])
const selectedPet = ref<Pet | null>(null)
const selectedDate = ref('')
const selectedTime = ref('')
const notes = ref('')
const availableSlots = ref<string[]>([])
const loading = ref(false)
const loadingSlots = ref(false)
const error = ref('')

// Computed
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return !!selectedPet.value
    case 1: return !!selectedDate.value
    case 2: return !!selectedTime.value
    case 3: return true
    default: return false
  }
})

// Methods
const loadPets = async () => {
  try {
    const data = await ownersService.getPets()
    pets.value = data
    // If pet was pre-selected from sessionStorage
    const storedPet = sessionStorage.getItem('selectedPet')
    if (storedPet) {
      const pet = JSON.parse(storedPet)
      selectedPet.value = pets.value.find(p => p.id === pet.id) || null
      sessionStorage.removeItem('selectedPet')
    }
  } catch (error) {
    console.error('Failed to load pets', error)
  }
}

const selectPet = (pet: Pet) => {
  selectedPet.value = pet
}

const getPetEmoji = (pet: Pet) => {
  const species = pet.species.toLowerCase()
  if (species.includes('dog')) return '🐕'
  if (species.includes('cat')) return '🐱'
  if (species.includes('bird')) return '🐦'
  if (species.includes('fish')) return '🐠'
  return '🐾'
}

const nextStep = () => {
  if (currentStep.value === 1 && selectedDate.value) {
    loadAvailableSlots()
  }
  if (canProceed.value && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const loadAvailableSlots = async () => {
  if (!selectedDate.value) return

  loadingSlots.value = true
  try {
    // TODO: Implement availability API call
    // For now, mock some slots
    availableSlots.value = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
    ]
  } catch (error) {
    console.error('Failed to load slots', error)
  } finally {
    loadingSlots.value = false
  }
}

const selectTime = (time: string) => {
  selectedTime.value = time
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (time: string) => {
  return time
}

const confirmBooking = async () => {
  if (!selectedPet.value || !selectedDate.value || !selectedTime.value) return

  loading.value = true
  error.value = ''
  try {
    const startAt = `${selectedDate.value}T${selectedTime.value}:00`
    const endAt = new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString() // 1 hour later

    await appointmentsService.createAppointment({
      petId: selectedPet.value.id,
      veterinarianId: '', // TODO: Get from availability
      startAt,
      endAt,
      status: 'Pending'
    })

    router.push('/owner')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to book appointment'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPets()
})
</script>