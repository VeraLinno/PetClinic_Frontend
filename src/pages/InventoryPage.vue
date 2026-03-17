<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Manage medications and supplies</p>
    </div>

    <!-- Low Stock Alert -->
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
          class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div>
            <h3 class="font-medium text-red-900 dark:text-red-400">{{ item.name }}</h3>
            <p class="text-sm text-red-700 dark:text-red-500">
              Current: {{ item.quantity }} {{ item.unit }} | Reorder Level: {{ item.reorderLevel }}
            </p>
          </div>
          <Button variant="danger" size="sm" @click="reorderItem(item)">Reorder</Button>
        </div>
      </div>
    </Card>

    <!-- Inventory List -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">All Items</h2>
          <div class="flex gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search items..."
              class="w-64"
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

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="py-3 px-4 text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="py-3 px-4 text-gray-500 dark:text-gray-400">{{ item.category }}</td>
              <td class="py-3 px-4 text-gray-900 dark:text-white">{{ item.quantity }} {{ item.unit }}</td>
              <td class="py-3 px-4 text-gray-900 dark:text-white">${{ item.unitPrice }}</td>
              <td class="py-3 px-4">
                <Badge :variant="getStatusVariant(item)">{{ getStatus(item) }}</Badge>
              </td>
              <td class="py-3 px-4">
                <Button variant="ghost" size="sm" @click="editItem(item)">Edit</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

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
const searchQuery = ref('')
const showAddModal = ref(false)

const lowStockItems = computed(() => {
  return items.value.filter(item => item.quantity <= item.reorderLevel)
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})

onMounted(() => {
  // Mock data
  items.value = [
    { id: '1', name: 'Rabies Vaccine', category: 'Vaccines', quantity: 5, unit: 'doses', unitPrice: 25, reorderLevel: 10 },
    { id: '2', name: 'Amoxicillin', category: 'Antibiotics', quantity: 2, unit: 'bottles', unitPrice: 15, reorderLevel: 5 },
    { id: '3', name: 'Syringes', category: 'Supplies', quantity: 100, unit: 'pcs', unitPrice: 0.5, reorderLevel: 50 },
    { id: '4', name: 'Heartworm Prevention', category: 'Medications', quantity: 20, unit: 'doses', unitPrice: 30, reorderLevel: 10 }
  ]
  loading.value = false
})

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

const reorderItem = (item: InventoryItem) => {
  console.log('Reorder', item.name)
}

const editItem = (item: InventoryItem) => {
  console.log('Edit', item.name)
}
</script>
