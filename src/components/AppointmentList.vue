<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div v-if="appointments.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
      No appointments found.
    </div>
    
    <!-- Appointments List -->
    <div 
      v-else
      class="divide-y divide-gray-200 dark:divide-gray-700"
      role="list"
      aria-label="Appointments"
    >
      <!-- Skeleton Loading Rows -->
      <template v-if="loading">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="py-4 px-4 sm:px-6"
        >
          <div class="flex items-center space-x-4">
            <div class="skeleton-avatar flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="skeleton-text w-3/4"></div>
              <div class="skeleton-text w-1/2"></div>
            </div>
            <div class="skeleton w-20 h-8 rounded" aria-hidden="true"></div>
          </div>
        </div>
      </template>
      
      <!-- Actual Appointments -->
      <Card
        v-for="appointment in appointments"
        :key="appointment.id"
        class="!shadow-none !rounded-none border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
        role="listitem"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <!-- Appointment Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ formatDate(appointment.startAt) }}
              </h3>
              <span 
                :class="statusBadgeClass(appointment.status)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ appointment.status }}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <span class="font-medium">Time:</span> 
              {{ formatTime(appointment.startAt) }} - {{ formatTime(appointment.endAt) }}
            </p>
            <p v-if="appointment.petName" class="text-sm text-gray-500 dark:text-gray-400">
              <span class="font-medium">Pet:</span> {{ appointment.petName }}
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-row sm:flex-col gap-2 sm:gap-2">
            <Button
              variant="primary"
              size="sm"
              @click="$emit('view', appointment)"
              :aria-label="`View details for appointment on ${formatDate(appointment.startAt)}`"
            >
              View
            </Button>
            <Button
              v-if="appointment.status === 'Pending' || appointment.status === 'Confirmed'"
              variant="success"
              size="sm"
              @click="$emit('start', appointment)"
              :aria-label="`Start visit for appointment on ${formatDate(appointment.startAt)}`"
            >
              Start
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { Appointment } from '@/services/appointments'

interface Props {
  appointments: Appointment[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  view: [appointment: Appointment]
  start: [appointment: Appointment]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pending': 'status-pending',
    'Confirmed': 'status-scheduled',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}
</script>
