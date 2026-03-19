<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">Manage medications and supplies</p>

      <div
        v-if="reorderSuccessMessage"
        class="mt-4 rounded-lg border border-success-300 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300"
      >
        {{ reorderSuccessMessage }}
      </div>

      <div
        v-if="loadError"
        class="mt-4 rounded-lg border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-800 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300"
      >
        {{ loadError }}
      </div>
    </div>

    <Card v-if="lowStockItems.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
        </div>
      </template>
      <div class="space-y-3">
        <div
          v-for="item in lowStockItems"
          :key="item.id"
          class="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="font-medium text-red-900 dark:text-red-400">{{ item.name }}</h3>
            <p class="text-sm text-red-700 dark:text-red-500">
              Current: {{ item.quantity }} {{ item.unit }} | Reorder Level: {{ item.reorderLevel }}
            </p>
          </div>
          <Button variant="danger" size="sm" @click="openReorderModal(item)">Reorder</Button>
        </div>
      </div>
    </Card>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="[
          'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          selectedCategory === category
            ? 'bg-primary-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
        ]"
      >
        {{ category }}
      </button>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">All Items</h2>
          <div class="flex gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search items..."
              class="w-full sm:w-64"
            />
            <Button variant="primary" @click="showAddModal = true">
              Add Item
            </Button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="w-full min-w-[760px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800">
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Stock</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ item.category }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ item.quantity }} {{ item.unit }}</td>
              <td class="px-4 py-3">
                <div class="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    class="h-full rounded-full"
                    :class="item.quantity <= item.reorderLevel ? 'bg-warning-500' : 'bg-success-500'"
                    :style="{ width: `${Math.min(100, (item.quantity / Math.max(item.reorderLevel * 2, 1)) * 100)}%` }"
                  />
                </div>
              </td>
              <td class="px-4 py-3 text-gray-900 dark:text-white">${{ item.unitPrice }}</td>
              <td class="px-4 py-3">
                <Badge :variant="getStatusVariant(item)">{{ getStatus(item) }}</Badge>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <Button variant="ghost" size="sm" @click="editItem(item)">Edit</Button>
                  <Button variant="outline" size="sm" @click="openReorderModal(item)">Reorder</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Modal :is-open="showAddModal" title="Add Inventory Item" @close="showAddModal = false">
      <div class="space-y-4">
        <Input v-model="newItem.name" label="Item Name" placeholder="e.g. Dewormer" />
        <Input v-model="newItem.category" label="Category" placeholder="e.g. Medications" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input v-model="newItem.quantity" label="Quantity" type="number" />
          <Input v-model="newItem.unitPrice" label="Unit Price" type="number" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showAddModal = false">Cancel</Button>
          <Button variant="primary" @click="addInventoryItem">Add</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showReorderModal" title="Reorder Item" @close="closeReorderModal">
      <div class="space-y-4" v-if="selectedReorderItem">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <p class="font-medium">{{ selectedReorderItem.name }}</p>
          <p>Current stock: {{ selectedReorderItem.quantity }} {{ selectedReorderItem.unit }}</p>
          <p>Reorder level: {{ selectedReorderItem.reorderLevel }}</p>
        </div>

        <Input
          v-model="reorderQuantity"
          type="number"
          label="Quantity to reorder"
          min="1"
          placeholder="Enter quantity"
          :error="reorderError"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="reorderLoading" @click="closeReorderModal">Cancel</Button>
          <Button variant="primary" :loading="reorderLoading" @click="submitReorder">Reorder</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Modal from '@/components/ui/Modal.vue'
import { inventoryService, type InventoryItem as ApiInventoryItem } from '@/services/inventory'

const breadcrumbItems = [
  { label: 'Inventory' }
]

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  unitPrice: number
  reorderLevel: number
}

const items = ref<InventoryItem[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const showAddModal = ref(false)
const showReorderModal = ref(false)
const selectedCategory = ref('All')
const selectedReorderItem = ref<InventoryItem | null>(null)
const reorderQuantity = ref('1')
const reorderLoading = ref(false)
const reorderError = ref('')
const reorderSuccessMessage = ref('')

const newItem = ref({
  name: '',
  category: '',
  quantity: '',
  unitPrice: ''
})

const categories = computed(() => {
  const unique = Array.from(new Set(items.value.map((i) => i.category)))
  return ['All', ...unique]
})

const lowStockItems = computed(() => {
  return items.value.filter(item => item.quantity <= item.reorderLevel)
})

const filteredItems = computed(() => {
  const filteredByCategory = selectedCategory.value === 'All'
    ? items.value
    : items.value.filter((item) => item.category === selectedCategory.value)

  if (!searchQuery.value) return filteredByCategory
  const query = searchQuery.value.toLowerCase()
  return filteredByCategory.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await loadInventory()
})

const getCategoryFromName = (name: string) => {
  const normalized = name.toLowerCase()
  if (normalized.includes('vaccine')) return 'Vaccines'
  if (normalized.includes('cillin') || normalized.includes('profen') || normalized.includes('aspirin')) return 'Antibiotics'
  return 'Medications'
}

const toInventoryItem = (item: ApiInventoryItem): InventoryItem => {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    reorderLevel: item.reorderLevel,
    category: getCategoryFromName(item.name),
    unitPrice: 0
  }
}

const loadInventory = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const data = await inventoryService.getInventory()
    items.value = data.map(toInventoryItem)
  } catch (error) {
    console.error('Failed to load inventory', error)
    loadError.value = 'Failed to load inventory items. Please try again.'
  } finally {
    loading.value = false
  }
}

const getStatus = (item: InventoryItem) => {
  if (item.quantity === 0) return 'Out of Stock'
  if (item.quantity <= item.reorderLevel) return 'Low Stock'
  return 'In Stock'
}

const getStatusVariant = (item: InventoryItem) => {
  if (item.quantity === 0) return 'danger'
  if (item.quantity <= item.reorderLevel) return 'warning'
  return 'success'
}

const openReorderModal = (item: InventoryItem) => {
  selectedReorderItem.value = item
  reorderQuantity.value = String(Math.max(1, item.reorderLevel))
  reorderError.value = ''
  showReorderModal.value = true
}

const closeReorderModal = () => {
  showReorderModal.value = false
  reorderLoading.value = false
  reorderError.value = ''
  selectedReorderItem.value = null
}

const submitReorder = async () => {
  if (!selectedReorderItem.value) {
    return
  }

  const quantity = Number(reorderQuantity.value)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    reorderError.value = 'Please enter a valid quantity greater than zero.'
    return
  }

  reorderLoading.value = true
  reorderError.value = ''

  try {
    const result = await inventoryService.reorderMedication(selectedReorderItem.value.id, quantity)
    const deliveryLocal = new Date(result.deliveryAtUtc).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    reorderSuccessMessage.value = `Reorder confirmed for ${result.medicationName}. Package will arrive tomorrow at ${deliveryLocal}.`
    closeReorderModal()
    await loadInventory()
  } catch (error) {
    console.error('Failed to reorder inventory item', error)
    reorderError.value = 'Could not place reorder. Please try again.'
  } finally {
    reorderLoading.value = false
  }
}

const editItem = (item: InventoryItem) => {
  console.log('Edit', item.name)
}

const addInventoryItem = () => {
  if (!newItem.value.name || !newItem.value.category) return
  items.value.push({
    id: Math.random().toString(36).slice(2, 8),
    name: newItem.value.name,
    category: newItem.value.category,
    quantity: Number(newItem.value.quantity) || 0,
    unit: 'pcs',
    unitPrice: Number(newItem.value.unitPrice) || 0,
    reorderLevel: 10
  })
  newItem.value = { name: '', category: '', quantity: '', unitPrice: '' }
  showAddModal.value = false
}
</script>
