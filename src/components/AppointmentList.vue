<template>
  <div class="space-y-4">
    <div v-if="appointments.length === 0" class="text-gray-500">
      No appointments found.
    </div>
    <div
      v-for="appointment in appointments"
      :key="appointment.id"
      class="bg-white overflow-hidden shadow rounded-lg"
    >
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Appointment on {{ new Date(appointment.date).toLocaleDateString() }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Status: {{ appointment.status }}
            </p>
            <p v-if="appointment.notes" class="mt-1 text-sm text-gray-500">
              Notes: {{ appointment.notes }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="$emit('view', appointment)"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Appointment } from '@/services/appointments'

defineProps<{
  appointments: Appointment[]
}>()

defineEmits<{
  view: [appointment: Appointment]
}>()
</script>