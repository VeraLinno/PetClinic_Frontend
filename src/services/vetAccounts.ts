import api from './api'

export interface VetAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  licenseNumber: string
  phoneNumber?: string
}

export interface CreateVetAccountPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  licenseNumber: string
  phoneNumber?: string
}

export interface UpdateVetAccountPayload {
  email: string
  firstName: string
  lastName: string
  licenseNumber: string
  phoneNumber?: string
}

export const vetAccountsService = {
  async getAll(): Promise<VetAccount[]> {
    const response = await api.get('/vets/accounts')
    return response.data
  },

  async create(payload: CreateVetAccountPayload): Promise<void> {
    await api.post('/vets/accounts', payload)
  },

  async update(id: string, payload: UpdateVetAccountPayload): Promise<VetAccount> {
    const response = await api.put(`/vets/accounts/${id}`, payload)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vets/accounts/${id}`)
  }
}
