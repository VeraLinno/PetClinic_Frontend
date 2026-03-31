<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('inventory.managementTitle') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ $t('inventory.managementSubtitle') }}</p>

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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('inventory.lowStockAlerts') }}</h2>
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
              {{ $t('inventory.current') }}: {{ item.quantity }} {{ localizeUnit(item.unit) }} | {{ $t('inventory.reorderLevelLabel') }}: {{ item.reorderLevel }}
            </p>
          </div>
          <Button variant="danger" size="sm" @click="openReorderModal(item)">{{ $t('inventory.reorder') }}</Button>
        </div>
      </div>
    </Card>

    <Card v-if="incomingReorders.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <Badge variant="primary" size="sm">{{ $t('inventory.incoming') }}</Badge>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('inventory.scheduledDeliveries') }}</h2>
        </div>
      </template>
      <div class="space-y-2">
        <div
          v-for="incoming in incomingReorders"
          :key="incoming.reorderId"
          class="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800 dark:border-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
        >
          {{ $t('inventory.incomingDeliveryText', { quantity: incoming.quantity, medicationName: incoming.medicationName, time: formatDeliveryTime(incoming.deliveryAtUtc) }) }}
        </div>
      </div>
    </Card>

    <Card>
      <template #header>
        <div class="flex items-center gap-2">
          <Badge variant="success" size="sm">{{ $t('inventory.delivered') }}</Badge>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('inventory.deliveredHistory') }}</h2>
        </div>
      </template>
      <div v-if="deliveredReorders.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
        {{ $t('inventory.noDeliveredReorders') }}
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="delivered in deliveredReorders"
          :key="delivered.reorderId"
          class="rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300"
        >
          {{ $t('inventory.deliveredDeliveryText', { quantity: delivered.quantity, medicationName: delivered.medicationName, time: formatDeliveryTime(delivered.receivedAtUtc) }) }}
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
        {{ localizeCategory(category) }}
      </button>
    </div>

    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('inventory.allItems') }}</h2>
          <div class="flex gap-2">
            <Input
              v-model="searchQuery"
              :placeholder="$t('inventory.searchItems')"
              class="w-full sm:w-64"
            />
            <Button variant="primary" @click="showAddModal = true">
              {{ $t('inventory.addItem') }}
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
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.name') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.category') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.quantity') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.stock') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.unitPrice') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.status') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('inventory.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ localizeCategory(item.category) }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ item.quantity }} {{ localizeUnit(item.unit) }}</td>
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
                  <Button variant="ghost" size="sm" @click="editItem(item)">{{ $t('common.edit') }}</Button>
                  <Button variant="outline" size="sm" @click="openReorderModal(item)">{{ $t('inventory.reorder') }}</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Modal :is-open="showAddModal" :title="$t('inventory.addInventoryItem')" @close="showAddModal = false">
      <div class="space-y-4">
        <Input v-model="newItem.name" :label="$t('inventory.itemName')" placeholder="e.g. Dewormer" />
        <Input v-model="newItem.category" :label="$t('inventory.category')" :placeholder="$t('inventory.category_medications')" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input v-model="newItem.quantity" :label="$t('inventory.quantity')" type="number" />
          <Input v-model="newItem.unitPrice" :label="$t('inventory.unitPrice')" type="number" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showAddModal = false">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" @click="addInventoryItem">{{ $t('common.add') }}</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showEditModal" :title="$t('inventory.editInventoryItem')" @close="closeEditModal">
      <div class="space-y-4" v-if="editingItemId">
        <Input v-model="editItemForm.name" :label="$t('inventory.itemName')" placeholder="e.g. Dewormer" :error="editItemError" />
        <Input v-model="editItemForm.category" :label="$t('inventory.category')" :placeholder="$t('inventory.category_medications')" :error="editItemError" />
        <Input
          v-model="editItemForm.unitPrice"
          :label="$t('inventory.unitPrice')"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 19.99"
          :error="editItemError"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="closeEditModal">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" :loading="editItemLoading" @click="saveEditedItem">{{ $t('common.save') }}</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showReorderModal" :title="$t('inventory.reorderItem')" @close="closeReorderModal">
      <div class="space-y-4" v-if="selectedReorderItem">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <p class="font-medium">{{ selectedReorderItem.name }}</p>
          <p>{{ $t('inventory.currentStock') }}: {{ selectedReorderItem.quantity }} {{ localizeUnit(selectedReorderItem.unit) }}</p>
          <p>{{ $t('inventory.reorderLevelText') }}: {{ selectedReorderItem.reorderLevel }}</p>
        </div>

        <Input
          v-model="reorderQuantity"
          type="number"
          :label="$t('inventory.quantityToReorder')"
          min="1"
          :placeholder="$t('inventory.enterQuantity')"
          :error="reorderError"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="reorderLoading" @click="closeReorderModal">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" :loading="reorderLoading" @click="submitReorder">{{ $t('inventory.reorder') }}</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import Modal from '@/components/ui/Modal.vue'
import {
  inventoryService,
  type InventoryItem as ApiInventoryItem,
  type PendingInventoryReorder,
  type DeliveredInventoryReorder
} from '@/services/inventory'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('navigation.inventory') }
])

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
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showReorderModal = ref(false)
const selectedCategory = ref('All')
const selectedReorderItem = ref<InventoryItem | null>(null)
const editingItemId = ref<string | null>(null)
const editItemLoading = ref(false)
const editItemError = ref('')
const reorderQuantity = ref('1')
const reorderLoading = ref(false)
const reorderError = ref('')
const reorderSuccessMessage = ref('')
const incomingReorders = ref<PendingInventoryReorder[]>([])
const deliveredReorders = ref<DeliveredInventoryReorder[]>([])

const newItem = ref({
  name: '',
  category: '',
  quantity: '',
  unitPrice: ''
})

const editItemForm = ref({
  name: '',
  category: '',
  unitPrice: ''
})

const categories = computed(() => {
  const unique = Array.from(new Set(items.value.map((i) => i.category)))
  return ['All', ...unique]
})

const normalizeTranslationKey = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const localizeCategory = (category: string) => {
  if (category === 'All') {
    return t('inventory.filterAll')
  }

  const normalized = normalizeTranslationKey(category)
  const translationKey = `inventory.category_${normalized}`
  const translated = t(translationKey)
  return translated === translationKey ? category : translated
}

const localizeUnit = (unit: string) => {
  const normalized = normalizeTranslationKey(unit)
  const translationKey = `inventory.unit_${normalized}`
  const translated = t(translationKey)
  return translated === translationKey ? unit : translated
}

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
  await loadIncomingReorders()
  await loadDeliveredReorders()
})

watch(
  () => route.query.search,
  (value) => {
    const queryValue = typeof value === 'string' ? value : ''
    if (queryValue !== searchQuery.value) {
      searchQuery.value = queryValue
    }
  }
)

watch(searchQuery, (value) => {
  const normalizedValue = value.trim()
  const currentQuery = typeof route.query.search === 'string' ? route.query.search : ''
  if (normalizedValue === currentQuery) {
    return
  }

  const nextQuery = { ...route.query }
  if (normalizedValue) {
    nextQuery.search = normalizedValue
  } else {
    delete nextQuery.search
  }

  router.replace({ query: nextQuery })
})

const toInventoryItem = (item: ApiInventoryItem): InventoryItem => {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    reorderLevel: item.reorderLevel,
    category: item.category || 'Medications',
    unitPrice: item.unitPrice
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
    loadError.value = t('inventory.loadFailed')
  } finally {
    loading.value = false
  }
}

const loadIncomingReorders = async () => {
  try {
    incomingReorders.value = await inventoryService.getIncomingReorders()
  } catch (error) {
    console.error('Failed to load incoming reorders', error)
  }
}

const loadDeliveredReorders = async () => {
  try {
    deliveredReorders.value = await inventoryService.getDeliveredReorders()
  } catch (error) {
    console.error('Failed to load delivered reorders', error)
  }
}

const formatDeliveryTime = (dateUtc: string) => {
  return new Date(dateUtc).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatus = (item: InventoryItem) => {
  if (item.quantity === 0) return t('inventory.statusOutOfStock')
  if (item.quantity <= item.reorderLevel) return t('inventory.statusLowStock')
  return t('inventory.statusInStock')
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
    reorderError.value = t('inventory.invalidQuantity')
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

    reorderSuccessMessage.value = `${t('inventory.reorderConfirmed')} ${result.medicationName}. ${t('inventory.packageArrives')} ${deliveryLocal}.`
    closeReorderModal()
    await loadInventory()
    await loadIncomingReorders()
    await loadDeliveredReorders()
  } catch (error) {
    console.error('Failed to reorder inventory item', error)
    reorderError.value = t('inventory.reorderFailed')
  } finally {
    reorderLoading.value = false
  }
}

const editItem = (item: InventoryItem) => {
  editingItemId.value = item.id
  editItemForm.value = {
    name: item.name,
    category: item.category,
    unitPrice: String(item.unitPrice)
  }
  editItemError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editItemLoading.value = false
  editingItemId.value = null
  editItemError.value = ''
}

const saveEditedItem = async () => {
  if (!editingItemId.value) {
    return
  }

  const normalizedName = editItemForm.value.name.trim()
  const normalizedCategory = editItemForm.value.category.trim()
  const unitPrice = Number(editItemForm.value.unitPrice)

  if (!normalizedName) {
    editItemError.value = t('inventory.itemNameRequired')
    return
  }

  if (!normalizedCategory) {
    editItemError.value = t('inventory.categoryRequired')
    return
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    editItemError.value = t('inventory.unitPriceInvalid')
    return
  }

  editItemLoading.value = true
  editItemError.value = ''

  try {
    const updated = await inventoryService.updateInventoryItem(editingItemId.value, {
      name: normalizedName,
      category: normalizedCategory,
      unitPrice
    })

    items.value = items.value.map((item) => {
      if (item.id !== updated.id) {
        return item
      }

      return {
        ...item,
        name: updated.name,
        category: updated.category,
        unitPrice: updated.unitPrice
      }
    })

    closeEditModal()
  } catch (error) {
    console.error('Failed to update inventory item', error)
    editItemError.value = t('inventory.updateFailed')
  } finally {
    editItemLoading.value = false
  }
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
