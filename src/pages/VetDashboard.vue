<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Vet Dashboard</h1>
          <button
            @click="logout"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h2 class="text-xl font-semibold mb-4">Today's Appointments</h2>
          <AppointmentList :appointments="appointments" @view="viewAppointment" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentsService, type Appointment } from '@/services/appointments'
import { authService } from '@/services/auth'
import AppointmentList from '@/components/AppointmentList.vue'

const router = useRouter()
const appointments = ref<Appointment[]>([])

onMounted(async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const data = await appointmentsService.getAppointments({ date: today })
    appointments.value = data
  } catch (error) {
    console.error('Failed to load appointments', error)
  }
})

const viewAppointment = (appointment: Appointment) => {
  router.push(`/visit/${appointment.id}`)
}

const logout = async () => {
  await authService.logout()
  router.push('/login')
}
</script>