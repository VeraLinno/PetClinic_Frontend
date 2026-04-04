import api from './api'
import { adminSandbox, isAdminSandboxMode } from './adminSandbox'

export interface Owner {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface Pet {
  id: string
  name: string
  species: string
  speciesLocalized?: string
  breed: string
  breedLocalized?: string
  dateOfBirth: string
  ownerId: string
  ownerName?: string
  lastVisitAt?: string | null
  photoUrl?: string
}

export interface CreatePetDto {
  name: string
  species: string
  breed: string
  dateOfBirth: string
}

export interface UpdateOwnerProfileDto {
  email: string
  firstName?: string
  lastName?: string
}

export interface VeterinarianOption {
  id: string
  name: string
  email: string
}

export interface OwnerInvoice {
  id: string
  visitId: string
  petName?: string | null
  amount: number
  issuedAt: string
  status: 'Paid' | 'Pending' | 'Overdue'
  paidAt?: string | null
  dueDate?: string | null
}

export const ownersService = {
  async getMe(): Promise<Owner> {
    if (isAdminSandboxMode()) {
      return adminSandbox.getOwner()
    }
    const response = await api.get('/owners/me')
    return response.data
  },

  async updateMe(profileData: UpdateOwnerProfileDto): Promise<Owner> {
    if (isAdminSandboxMode()) {
      return adminSandbox.updateOwner(profileData)
    }
    const response = await api.put('/owners/me', profileData)
    return response.data
  },

  async getPets(ownerId: string = 'me'): Promise<Pet[]> {
    if (isAdminSandboxMode()) {
      return adminSandbox.getPets()
    }
    const response = await api.get(`/owners/${ownerId}/pets`)
    return response.data
  },

  async getAllPets(): Promise<Pet[]> {
    if (isAdminSandboxMode()) {
      return adminSandbox.getPets()
    }
    const response = await api.get('/owners/pets')
    return response.data
  },

  async getVeterinarians(): Promise<VeterinarianOption[]> {
    if (isAdminSandboxMode()) {
      return adminSandbox.getVeterinarians()
    }
    const response = await api.get('/owners/vets')
    return response.data
  },

  async createPet(petData: CreatePetDto): Promise<Pet> {
    if (isAdminSandboxMode()) {
      return adminSandbox.createPet(petData)
    }
    const response = await api.post('/owners/me/pets', petData)
    return response.data
  },

  async updatePet(petId: string, petData: Partial<CreatePetDto>): Promise<Pet> {
    if (isAdminSandboxMode()) {
      return adminSandbox.updatePet(petId, petData)
    }
    const response = await api.put(`/owners/me/pets/${petId}`, petData)
    return response.data
  },

  async deletePet(petId: string): Promise<void> {
    if (isAdminSandboxMode()) {
      adminSandbox.deletePet(petId)
      return
    }
    await api.delete(`/owners/me/pets/${petId}`)
  },

  async deletePetForVet(petId: string): Promise<void> {
    if (isAdminSandboxMode()) {
      adminSandbox.deletePet(petId)
      return
    }
    await api.delete(`/owners/pets/${petId}`)
  },

  async getPetHealthRecords(petId: string): Promise<any> {
    const response = await api.get(`/owners/me/pets/${petId}/health-records`)
    return response.data
  },

  async getMyInvoices(): Promise<OwnerInvoice[]> {
    if (isAdminSandboxMode()) {
      return []
    }
    const response = await api.get('/owners/me/invoices')
    return response.data
  },

  async markInvoicePaid(invoiceId: string): Promise<OwnerInvoice> {
    if (isAdminSandboxMode()) {
      throw new Error('Marking invoices as paid is not available in admin sandbox mode.')
    }
    const response = await api.post(`/owners/me/invoices/${invoiceId}/mark-paid`)
    return response.data
  }
}