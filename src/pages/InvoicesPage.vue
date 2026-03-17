<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">View and pay your invoices</p>
    </div>

    <!-- Filters -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">All Invoices</h2>
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-else-if="filteredInvoices.length === 0" class="text-center py-8 text-gray-500">
        No invoices found.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="invoice in filteredInvoices"
          :key="invoice.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">Invoice #{{ invoice.id }}</h3>
              <p class="text-sm text-gray-500">{{ invoice.petName }} - {{ formatDate(invoice.date) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="font-bold text-gray-900 dark:text-white">${{ invoice.total }}</p>
              <Badge :variant="getStatusVariant(invoice.status)" size="sm">{{ invoice.status }}</Badge>
            </div>
            <Button v-if="invoice.status !== 'Paid'" variant="primary" size="sm" @click="payInvoice(invoice)">
              Pay Now
            </Button>
            <Button variant="secondary" size="sm" @click="downloadInvoice(invoice)">
              Download
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

interface Invoice {
  id: string
  petName: string
  date: string
  total: number
  status: 'Paid' | 'Pending' | 'Overdue'
}

const invoices = ref<Invoice[]>([])
const loading = ref(true)
const statusFilter = ref('')

const filteredInvoices = computed(() => {
  if (!statusFilter.value) return invoices.value
  return invoices.value.filter(i => i.status === statusFilter.value)
})

onMounted(() => {
  // Mock data
  invoices.value = [
    { id: 'INV001', petName: 'Buddy', date: '2024-02-20', total: 200, status: 'Pending' },
    { id: 'INV002', petName: 'Buddy', date: '2024-01-15', total: 150, status: 'Paid' }
  ]
  loading.value = false
})

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const getStatusVariant = (status: string) => {
  if (status === 'Paid') return 'success'
  if (status === 'Overdue') return 'danger'
  return 'warning'
}

const payInvoice = (invoice: Invoice) => {
  console.log('Pay', invoice.id)
}

const downloadInvoice = (invoice: Invoice) => {
  console.log('Download', invoice.id)
}
</script>
