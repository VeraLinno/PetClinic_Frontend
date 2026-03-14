<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Visit Details</h1>
          <button
            @click="$router.go(-1)"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div v-if="loading" class="text-center">Loading...</div>
        <div v-else-if="visit" class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h2 class="text-xl font-semibold mb-4">Visit Information</h2>
          <div class="space-y-4">
            <div>
              <strong>Appointment ID:</strong> {{ visit.appointmentId }}
            </div>
            <div>
              <strong>Notes:</strong> {{ visit.notes }}
            </div>
            <div v-if="visit.invoice">
              <strong>Invoice:</strong>
              <pre class="bg-gray-100 p-4 rounded">{{ JSON.stringify(visit.invoice, null, 2) }}</pre>
            </div>
            <div v-if="canComplete">
              <button
                @click="completeVisit"
                :disabled="completing"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {{ completing ? 'Completing...' : 'Complete Visit' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-red-500">
          Visit not found
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { appointmentsService, type Visit } from '@/services/appointments'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const visit = ref<Visit | null>(null)
const loading = ref(true)
const completing = ref(false)
const authStore = useAuthStore()

const visitId = route.params.id as string

onMounted(async () => {
  try {
    visit.value = await appointmentsService.getVisit(visitId)
  } catch (error) {
    console.error('Failed to load visit', error)
  } finally {
    loading.value = false
  }
})

const canComplete = authStore.roles.includes('Vet')

const completeVisit = async () => {
  if (!visit.value) return
  completing.value = true
  try {
    await appointmentsService.completeVisit(visitId, { notes: 'Visit completed' })
    // Reload visit
    visit.value = await appointmentsService.getVisit(visitId)
  } catch (error) {
    console.error('Failed to complete visit', error)
  } finally {
    completing.value = false
  }
}
</script>