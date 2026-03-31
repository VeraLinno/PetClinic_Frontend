<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('invoices.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ $t('invoices.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('invoices.totalDue') }}</p>
        <p class="mt-1 text-3xl font-bold text-danger-700 dark:text-danger-300">${{ totalDue }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('invoices.paidThisMonth') }}</p>
        <p class="mt-1 text-3xl font-bold text-success-700 dark:text-success-300">${{ paidThisMonth }}</p>
      </Card>
      <Card>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('invoices.totalInvoices') }}</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{{ invoices.length }}</p>
      </Card>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('invoices.allInvoices') }}</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              :class="[
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              ]"
              @click="statusFilter = option.value"
            >
              {{ option.label }}
            </button>

            <select
              v-model="dateRange"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="30d">{{ $t('invoices.last30Days') }}</option>
              <option value="month">{{ $t('dashboard.vet.thisMonth') }}</option>
              <option value="3m">{{ $t('invoices.last3Months') }}</option>
              <option value="all">{{ $t('invoices.allTime') }}</option>
            </select>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-else-if="filteredInvoices.length === 0" class="py-8 text-center text-gray-500">
        {{ $t('invoices.noInvoices') }}
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="invoice in filteredInvoices"
          :key="invoice.id"
          class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ $t('invoices.invoiceNumber') }}{{ invoice.id }}</h3>
              <p class="text-sm text-gray-500">{{ invoice.petName }} - {{ formatDate(invoice.date) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="font-bold" :class="invoice.status === 'overdue' ? 'text-danger-700 dark:text-danger-300' : 'text-gray-900 dark:text-white'">${{ invoice.total }}</p>
              <Badge :variant="getStatusVariant(invoice.status)" size="sm">{{ getStatusLabel(invoice.status) }}</Badge>
            </div>
            <Button v-if="invoice.status !== 'paid'" variant="primary" size="sm" @click="payInvoice(invoice)">
              {{ $t('invoices.payNow') }}
            </Button>
            <Button variant="outline" size="sm" @click="downloadInvoice(invoice)">
              {{ $t('invoices.download') }}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const { t } = useI18n()

const breadcrumbItems = [
  { label: t('invoices.title') }
]

interface Invoice {
  id: string
  petName: string
  date: string
  total: number
  status: 'paid' | 'pending' | 'overdue'
}

type InvoiceStatusFilter = 'all' | 'pending' | 'paid' | 'overdue'

const invoices = ref<Invoice[]>([])
const loading = ref(true)
const statusOptions = computed<{ value: InvoiceStatusFilter; label: string }[]>(() => [
  { value: 'all', label: t('appointments.status_all') },
  { value: 'pending', label: t('invoices.status_pending') },
  { value: 'paid', label: t('invoices.status_paid') },
  { value: 'overdue', label: t('invoices.status_overdue') }
])
const statusFilter = ref<InvoiceStatusFilter>('all')
const dateRange = ref('30d')

const filteredInvoices = computed(() => {
  const now = new Date()
  const byDate = invoices.value.filter((invoice) => {
    if (dateRange.value === 'all') return true
    const d = new Date(invoice.date)
    if (dateRange.value === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (dateRange.value === '3m') {
      const from = new Date(now)
      from.setMonth(from.getMonth() - 3)
      return d >= from
    }
    const from = new Date(now)
    from.setDate(from.getDate() - 30)
    return d >= from
  })

  if (statusFilter.value === 'all') return byDate
  return byDate.filter(i => i.status === statusFilter.value)
})

const totalDue = computed(() => {
  return invoices.value.filter(i => i.status !== 'paid').reduce((acc, cur) => acc + cur.total, 0)
})

const paidThisMonth = computed(() => {
  const now = new Date()
  return invoices.value
    .filter(i => i.status === 'paid')
    .filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((acc, cur) => acc + cur.total, 0)
})

onMounted(() => {
  // Mock data
  invoices.value = [
    { id: 'INV001', petName: 'Buddy', date: '2024-02-20', total: 200, status: 'pending' },
    { id: 'INV002', petName: 'Buddy', date: '2024-01-15', total: 150, status: 'paid' },
    { id: 'INV003', petName: 'Whiskers', date: '2024-01-08', total: 340, status: 'overdue' }
  ]
  loading.value = false
})

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const getStatusVariant = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'danger'
  return 'warning'
}

const getStatusLabel = (status: 'paid' | 'pending' | 'overdue') => t(`invoices.status_${status}`)

const payInvoice = (invoice: Invoice) => {
  console.log('Pay', invoice.id)
}

const downloadInvoice = (invoice: Invoice) => {
  console.log('Download', invoice.id)
}
</script>
