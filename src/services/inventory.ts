import type { Method } from 'axios'
import api from './api'

export interface InventoryItem {
  id: string
  name: string
  category: string
  unitPrice: number
  quantity: number
  unit: string
  reorderLevel: number
}

export interface UpdateInventoryItemPayload {
  name: string
  category: string
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

async function requestWithInventoryFallback<T>(method: Method, path: string, data?: unknown): Promise<T> {
  try {
    const response = await api.request<T>({ method, url: path, data })
    return response.data
  } catch (error: any) {
    const status = error?.response?.status
    const baseUrl = String(api.defaults.baseURL || '')
    const hasV1Base = /\/v1\/?$/.test(baseUrl)

    if (status !== 404 || !hasV1Base) {
      throw error
    }

    const fallbackBaseUrl = baseUrl.replace(/\/v1\/?$/, '')
    const response = await api.request<T>({ method, baseURL: fallbackBaseUrl, url: path, data })
    return response.data
  }
}

export const inventoryService = {
  async getInventory() {
    return requestWithInventoryFallback<InventoryItem[]>('GET', '/inventory')
  },

  async getLowStock() {
    return requestWithInventoryFallback<InventoryItem[]>('GET', '/inventory/low-stock')
  },

  async updateInventoryItem(id: string, payload: UpdateInventoryItemPayload) {
    return requestWithInventoryFallback<InventoryItem>('PUT', `/inventory/${id}`, payload)
  },

  async reorderMedication(medicationId: string, quantity: number) {
    return requestWithInventoryFallback<ReorderResponse>('POST', `/inventory/${medicationId}/reorder`, { quantity })
  },

  async getIncomingReorders() {
    return requestWithInventoryFallback<PendingInventoryReorder[]>('GET', '/inventory/incoming')
  },

  async getDeliveredReorders() {
    return requestWithInventoryFallback<DeliveredInventoryReorder[]>('GET', '/inventory/delivered')
  }
}
