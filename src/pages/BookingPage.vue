<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Book Appointment</h1>
      </div>
    </header>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="petId" class="block text-sm font-medium text-gray-700">Pet ID</label>
              <input
                id="petId"
                v-model="form.petId"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="vetId" class="block text-sm font-medium text-gray-700">Vet ID</label>
              <input
                id="vetId"
                v-model="form.vetId"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
              <input
                id="date"
                v-model="form.date"
                type="date"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex space-x-4">
              <button
                type="submit"
                :disabled="loading"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {{ loading ? 'Booking...' : 'Book Appointment' }}
              </button>
              <button
                type="button"
                @click="$router.push('/owner')"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
          <div v-if="error" class="mt-4 text-red-500">
            {{ error }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentsService } from '@/services/appointments'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = ref({
  petId: '',
  vetId: '',
  date: '',
  notes: ''
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await appointmentsService.createAppointment({
      petId: form.value.petId,
      vetId: form.value.vetId,
      ownerId: 'me', // Assuming current user
      date: form.value.date,
      status: 'Scheduled',
      notes: form.value.notes
    })
    router.push('/owner')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to book appointment'
  } finally {
    loading.value = false
  }
}
</script>