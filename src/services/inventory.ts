import api from './api'

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  reorderLevel: number
}

export interface ReorderResponse {
  medicationId: string
  medicationName: string
  orderedQuantity: number
  currentQuantity: number
  deliveryAtUtc: string
  message: string
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

  async reorderMedication(medicationId: string, quantity: number) {
    const response = await api.post<ReorderResponse>(`/inventory/${medicationId}/reorder`, { quantity })
    return response.data
  }
}
