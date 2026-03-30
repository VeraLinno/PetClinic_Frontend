<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Header -->
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manage Availability</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Mark days when you are unavailable (vacation, time off, etc.). These dates will be blocked for booking appointments.
        </p>
      </div>
    </div>

    <!-- Add Unavailability Form -->
    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Add Unavailable Period</h2>
      </template>
      <div class="space-y-4 p-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label for="start-date" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date <span class="text-danger-600">*</span>
            </label>
            <Input
              id="start-date"
              v-model="formData.startDate"
              type="date"
              :min="today"
              placeholder="Select start date"
              @input="clearError"
            />
          </div>
          <div>
            <label for="end-date" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date <span class="text-danger-600">*</span>
            </label>
            <Input
              id="end-date"
              v-model="formData.endDate"
              type="date"
              :min="today"
              placeholder="Select end date"
              @input="clearError"
            />
          </div>
        </div>

        <div>
          <label for="reason" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason (optional)
          </label>
          <select
            id="reason"
            v-model="formData.reason"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">None</option>
            <option value="Vacation">Vacation</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Conference">Conference</option>
            <option value="Training">Training</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Error Message -->
        <div v-if="formError" class="rounded-lg border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
          {{ formError }}
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            @click="resetForm"
            :disabled="loading"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            @click="submitForm"
            :loading="loading"
            :disabled="!isFormValid || loading"
          >
            Add Period
          </Button>
        </div>
      </div>
    </Card>

    <!-- Existing Unavailable Periods List -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Unavailable Periods</h2>
          <Badge v-if="availabilityStore.unavailablePeriods.length > 0" variant="primary" size="sm">
            {{ availabilityStore.unavailablePeriods.length }}
          </Badge>
        </div>
      </template>

      <div class="p-6">
        <!-- Loading State -->
        <div v-if="availabilityStore.loading" class="space-y-3">
          <div class="flex items-center justify-between border-b border-slate-200 py-4 dark:border-slate-700">
            <div class="h-4 w-32 animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div class="h-4 w-24 animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
          <div class="flex items-center justify-between border-b border-slate-200 py-4 dark:border-slate-700">
            <div class="h-4 w-32 animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div class="h-4 w-24 animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="availabilityStore.unavailablePeriods.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <p class="text-slate-500 dark:text-slate-400">No unavailable periods yet.</p>
          <p class="text-sm text-slate-400 dark:text-slate-500">Add your first unavailable period using the form above.</p>
        </div>

        <!-- List Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date Range</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Duration</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="period in availabilityStore.unavailablePeriods"
                :key="period.id"
                class="border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
              >
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {{ formatDateRange(period.startDate, period.endDate) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  <Badge v-if="period.reason" variant="primary" size="sm">
                    {{ period.reason }}
                  </Badge>
                  <span v-else class="text-slate-400 dark:text-slate-500">—</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {{ getDuration(period.startDate, period.endDate) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openEditModal(period)"
                      :disabled="loading"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openDeleteConfirm(period)"
                      :disabled="loading"
                      class="text-danger-600 dark:text-danger-400"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>

    <!-- Delete Confirmation Modal -->
    <Modal
      :isOpen="!!deleteConfirmPeriod"
      title="Delete Unavailable Period"
      @close="deleteConfirmPeriod = null"
    >
      <template #default>
        <div class="space-y-4">
          <p class="text-slate-600 dark:text-slate-400">
            Are you sure you want to delete the unavailable period for
            <span class="font-semibold text-slate-900 dark:text-slate-100">
              {{ deleteConfirmPeriod ? formatDateRange(deleteConfirmPeriod.startDate, deleteConfirmPeriod.endDate) : '' }}
            </span>?
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            variant="secondary"
            @click="deleteConfirmPeriod = null"
            :disabled="loading"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            @click="confirmDelete"
            :loading="loading"
            :disabled="loading"
          >
            Delete
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Edit Modal -->
    <Modal
      :isOpen="!!editingPeriod"
      title="Edit Unavailable Period"
      @close="editingPeriod = null"
    >
      <template #default>
        <div class="space-y-4 p-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="edit-start-date" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date <span class="text-danger-600">*</span>
              </label>
              <Input
                id="edit-start-date"
                v-model="editFormData.startDate"
                type="date"
                :min="today"
                placeholder="Select start date"
              />
            </div>
            <div>
              <label for="edit-end-date" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date <span class="text-danger-600">*</span>
              </label>
              <Input
                id="edit-end-date"
                v-model="editFormData.endDate"
                type="date"
                :min="today"
                placeholder="Select end date"
              />
            </div>
          </div>

          <div>
            <label for="edit-reason" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason (optional)
            </label>
            <select
              id="edit-reason"
              v-model="editFormData.reason"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">None</option>
              <option value="Vacation">Vacation</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Conference">Conference</option>
              <option value="Training">Training</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Error Message -->
          <div v-if="editFormError" class="rounded-lg border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
            {{ editFormError }}
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            variant="secondary"
            @click="editingPeriod = null"
            :disabled="loading"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            @click="saveEdit"
            :loading="loading"
            :disabled="loading || !isEditFormValid"
          >
            Update
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Success Toast (shown via component lifecycle) -->
    <div v-if="showSuccessMessage" class="fixed bottom-4 right-4 rounded-lg border border-success-300 bg-success-50 p-4 shadow-lg dark:border-success-700 dark:bg-success-950/40">
      <div class="flex items-center gap-3">
        <CheckCircleIcon class="h-5 w-5 text-success-600 dark:text-success-400" aria-hidden="true" />
        <p class="text-sm font-medium text-success-700 dark:text-success-300">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAvailabilityStore, type UnavailablePeriod } from '@/stores/availability'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import Badge from '@/components/ui/Badge.vue'

const availabilityStore = useAvailabilityStore()

const formData = ref({
  startDate: '',
  endDate: '',
  reason: ''
})

const loading = ref(false)
const formError = ref('')
const deleteConfirmPeriod = ref<UnavailablePeriod | null>(null)
const editingPeriod = ref<UnavailablePeriod | null>(null)
const editFormData = ref({
  startDate: '',
  endDate: '',
  reason: ''
})
const editFormError = ref('')
const showSuccessMessage = ref(false)
const successMessage = ref('')

const today = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const isFormValid = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) {
    return false
  }
  return formData.value.startDate <= formData.value.endDate
})

const isEditFormValid = computed(() => {
  if (!editFormData.value.startDate || !editFormData.value.endDate) {
    return false
  }
  return editFormData.value.startDate <= editFormData.value.endDate
})

const clearError = () => {
  formError.value = ''
}

const validateDateRange = (): boolean => {
  clearError()

  if (!formData.value.startDate || !formData.value.endDate) {
    formError.value = 'Both start and end dates are required'
    return false
  }

  if (formData.value.startDate > formData.value.endDate) {
    formError.value = 'End date must be on or after start date'
    return false
  }

  // Check for overlaps
  const newStart = new Date(formData.value.startDate)
  const newEnd = new Date(formData.value.endDate)

  for (const period of availabilityStore.unavailablePeriods) {
    const existingStart = new Date(period.startDate)
    const existingEnd = new Date(period.endDate)

    if (newStart <= existingEnd && newEnd >= existingStart) {
      formError.value = `Date range overlaps with existing period: ${formatDateRange(period.startDate, period.endDate)}`
      return false
    }
  }

  return true
}

const submitForm = async () => {
  if (!validateDateRange()) {
    return
  }

  loading.value = true
  try {
    await availabilityStore.addUnavailablePeriod(
      formData.value.startDate,
      formData.value.endDate,
      formData.value.reason || undefined
    )

    successMessage.value = 'Unavailable period added successfully'
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    resetForm()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Failed to add unavailable period'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    startDate: '',
    endDate: '',
    reason: ''
  }
  formError.value = ''
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatDateRange = (startStr: string, endStr: string): string => {
  if (startStr === endStr) {
    return formatDate(startStr)
  }
  return `${formatDate(startStr)} – ${formatDate(endStr)}`
}

const getDuration = (startStr: string, endStr: string): string => {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

const openDeleteConfirm = (period: UnavailablePeriod) => {
  deleteConfirmPeriod.value = period
}

const openEditModal = (period: UnavailablePeriod) => {
  editingPeriod.value = period
  editFormData.value = {
    startDate: period.startDate,
    endDate: period.endDate,
    reason: period.reason || ''
  }
  editFormError.value = ''
}

const confirmDelete = async () => {
  if (!deleteConfirmPeriod.value) return

  loading.value = true
  try {
    await availabilityStore.deleteUnavailablePeriod(deleteConfirmPeriod.value.id)
    successMessage.value = 'Unavailable period deleted successfully'
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    deleteConfirmPeriod.value = null
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Failed to delete unavailable period'
  } finally {
    loading.value = false
  }
}

const validateEditDateRange = (): boolean => {
  editFormError.value = ''

  if (!editFormData.value.startDate || !editFormData.value.endDate) {
    editFormError.value = 'Both start and end dates are required'
    return false
  }

  if (editFormData.value.startDate > editFormData.value.endDate) {
    editFormError.value = 'End date must be on or after start date'
    return false
  }

  // Check for overlaps with other periods
  const editStart = new Date(editFormData.value.startDate)
  const editEnd = new Date(editFormData.value.endDate)

  for (const period of availabilityStore.unavailablePeriods) {
    // Skip the period being edited
    if (editingPeriod.value && period.id === editingPeriod.value.id) {
      continue
    }

    const existingStart = new Date(period.startDate)
    const existingEnd = new Date(period.endDate)

    if (editStart <= existingEnd && editEnd >= existingStart) {
      editFormError.value = `Date range overlaps with existing period: ${formatDateRange(period.startDate, period.endDate)}`
      return false
    }
  }

  return true
}

const saveEdit = async () => {
  if (!editingPeriod.value || !validateEditDateRange()) {
    return
  }

  loading.value = true
  try {
    await availabilityStore.updateUnavailablePeriod(
      editingPeriod.value.id,
      editFormData.value.startDate,
      editFormData.value.endDate,
      editFormData.value.reason || undefined
    )

    successMessage.value = 'Unavailable period updated successfully'
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    editingPeriod.value = null
    editFormData.value = { startDate: '', endDate: '', reason: '' }
  } catch (err: any) {
    editFormError.value = err.response?.data?.message || 'Failed to update unavailable period'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await availabilityStore.fetchUnavailablePeriods()
  } catch (err) {
    console.error('Failed to load availability data:', err)
  } finally {
    loading.value = false
  }
})
</script>
