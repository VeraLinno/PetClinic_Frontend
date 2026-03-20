import api from './api'

export interface InventoryItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  unit: string
  reorderLevel: number
}

export interface UpdateInventoryItemPayload {
  name: string
  unitPrice: number
}

export interface ReorderResponse {
  medicationId: string
  medicationName: string
  orderedQuantity: number
  currentQuantity: number
  deliveryAtUtc: string
  message: string
}

export interface PendingInventoryReorder {
  reorderId: string
  medicationId: string
  medicationName: string
  quantity: number
  deliveryAtUtc: string
}

export interface DeliveredInventoryReorder {
  reorderId: string
  medicationId: string
  medicationName: string
  quantity: number
  deliveryAtUtc: string
  receivedAtUtc: string
}

export const inventoryService = {
  async getInventory() {
    const response = await api.get<InventoryItem[]>('/inventory')
    return response.data
  },

  async getLowStock() {
    const response = await api.get<InventoryItem[]>('/inventory/low-stock')
    return response.data
  },

  async updateInventoryItem(id: string, payload: UpdateInventoryItemPayload) {
    const response = await api.put<InventoryItem>(`/inventory/${id}`, payload)
    return response.data
  },

  async reorderMedication(medicationId: string, quantity: number) {
    const response = await api.post<ReorderResponse>(`/inventory/${medicationId}/reorder`, { quantity })
    return response.data
  },

  async getIncomingReorders() {
    const response = await api.get<PendingInventoryReorder[]>('/inventory/incoming')
    return response.data
  },

  async getDeliveredReorders() {
    const response = await api.get<DeliveredInventoryReorder[]>('/inventory/delivered')
    return response.data
  }
}
