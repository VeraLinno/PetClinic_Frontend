<template>
  <div class="space-y-4">
    <div v-if="appointments.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
      No appointments found.
    </div>

    <div 
      v-else
      class="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800"
      role="list"
      aria-label="Appointments"
    >
      <template v-if="loading">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="px-4 py-4 sm:px-6"
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

      <Card
        v-for="appointment in appointments"
        :key="appointment.id"
        class="!rounded-none border-0 !shadow-none transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        role="listitem"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ formatDate(appointment.startAt) }}
              </h3>
              <span 
                :class="statusBadgeClass(appointment.status)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getStatusLabel(appointment) }}
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              <span class="font-medium">Time:</span> 
              {{ formatTime(appointment.startAt) }} - {{ formatTime(getVisitEndAt(appointment)) }}
            </p>
            <p v-if="appointment.petName" class="text-sm text-slate-500 dark:text-slate-400">
              <span class="font-medium">Pet:</span> {{ appointment.petName }}
            </p>
          </div>

          <div class="flex flex-row sm:flex-col gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="$emit('view', appointment)"
              :aria-label="`View details for appointment on ${formatDate(appointment.startAt)}`"
            >
              View
            </Button>
            <Button
              v-if="showConfirm && appointment.status === 'Pending'"
              variant="primary"
              size="sm"
              @click="$emit('confirm', appointment)"
              :aria-label="`Confirm appointment on ${formatDate(appointment.startAt)}`"
            >
              Confirm
            </Button>
            <Button
              v-if="showStart && (appointment.status === 'Confirmed' || appointment.status === 'Scheduled')"
              variant="success"
              size="sm"
              @click="$emit('start', appointment)"
              :aria-label="`Start visit for appointment on ${formatDate(appointment.startAt)}`"
            >
              Start
            </Button>
            <Button
              v-if="showCancel && (appointment.status === 'Pending' || appointment.status === 'Confirmed' || appointment.status === 'Scheduled')"
              variant="danger"
              size="sm"
              @click="$emit('cancel', appointment)"
              :aria-label="`Cancel appointment on ${formatDate(appointment.startAt)}`"
            >
              Cancel
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
import { useI18n } from 'vue-i18n'
import type { Appointment } from '@/services/appointments'

interface Props {
  appointments: Appointment[]
  loading?: boolean
  showConfirm?: boolean
  showStart?: boolean
  showCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  showConfirm: false,
  showStart: false,
  showCancel: false
})

defineEmits<{
  view: [appointment: Appointment]
  confirm: [appointment: Appointment]
  start: [appointment: Appointment]
  cancel: [appointment: Appointment]
}>()

const { t } = useI18n()

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

const getVisitEndAt = (appointment: Appointment) => {
  const startDate = new Date(appointment.startAt)
  if (Number.isNaN(startDate.getTime())) {
    return appointment.endAt
  }

  return new Date(startDate.getTime() + 60 * 60 * 1000).toISOString()
}

const statusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pending': 'status-pending',
    'Confirmed': 'status-scheduled',
    'Scheduled': 'status-scheduled',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getStatusLabel = (appointment: Appointment) => {
  if (appointment.statusLocalized) {
    return appointment.statusLocalized
  }

  const map: Record<string, string> = {
    Pending: 'appointments.status_pending',
    Confirmed: 'appointments.status_confirmed',
    Scheduled: 'appointments.status_scheduled',
    Completed: 'appointments.status_completed',
    Cancelled: 'appointments.status_cancelled'
  }

  const key = map[appointment.status]
  if (!key) {
    return appointment.status
  }

  const localized = t(key)
  return localized === key ? appointment.status : localized
}
</script>
