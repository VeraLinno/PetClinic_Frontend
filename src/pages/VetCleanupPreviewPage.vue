<template>
  <div class="space-y-6">
    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Vet Account Cleanup (Dry-Run Preview)</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Preview vet accounts eligible for cleanup. No accounts are deleted.</p>
          </div>
          <Button variant="primary" size="sm" :loading="loading" @click="performDryRun">
            {{ loading ? 'Generating Preview...' : 'Generate Dry-Run Preview' }}
          </Button>
        </div>
      </template>

      <div v-if="error" class="mb-4 rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
        {{ error }}
      </div>

      <div v-if="dryRunResult">
        <div class="mb-6 space-y-3">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 class="font-semibold text-slate-900 dark:text-slate-100">Summary</h3>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ dryRunResult.notes }}</p>
            <div class="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Protected Accounts</p>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ dryRunResult.totalProtectedCount }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Candidate Accounts</p>
                <p class="text-lg font-bold text-danger-600 dark:text-danger-400">{{ dryRunResult.totalCandidateCount }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Appointments Impacted</p>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ dryRunResult.totalAppointmentsImpacted }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Active Tokens Impacted</p>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ dryRunResult.totalActiveTokensImpacted }}</p>
              </div>
            </div>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Preview Hash: {{ dryRunResult.previewHash }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Generated: {{ formatDateTime(dryRunResult.previewGeneratedAtUtc) }}</p>
          </div>
        </div>

        <div v-if="dryRunResult.totalCandidateCount > 0" class="space-y-4">
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">Cleanup Candidates ({{ dryRunResult.totalCandidateCount }})</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">License</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created At</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created By</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reason</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Appointments</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active Tokens</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="candidate in dryRunResult.candidates" :key="candidate.vetAccountId">
                  <td class="px-3 py-3 text-sm text-slate-900 dark:text-slate-100">{{ candidate.firstName }} {{ candidate.lastName }}</td>
                  <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ candidate.email }}</td>
                  <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ candidate.licenseNumber }}</td>
                  <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ formatDate(candidate.createdAtUtc) }}</td>
                  <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ candidate.createdByEmail }}</td>
                  <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ candidate.reason }}</td>
                  <td class="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{{ candidate.appointmentCount }}</td>
                  <td class="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{{ candidate.activeRefreshTokenCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="mt-4 rounded-lg border border-success-300 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300">
          ✓ No accounts are candidates for cleanup. All existing vet accounts are protected.
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { vetCleanupService, type VetCleanupDryRunResponse } from '@/services/vetCleanup'

const { locale } = useI18n()

const loading = ref(false)
const error = ref('')
const dryRunResult = ref<VetCleanupDryRunResponse | null>(null)

const performDryRun = async () => {
  loading.value = true
  error.value = ''
  dryRunResult.value = null

  try {
    dryRunResult.value = await vetCleanupService.previewCleanup()
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Failed to preview cleanup. Make sure you have admin access.'
  } finally {
    loading.value = false
  }
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>
