import api from './api'

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
  breed: string
  dateOfBirth: string
  ownerId: string
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

export const ownersService = {
  async getMe(): Promise<Owner> {
    const response = await api.get('/owners/me')
    return response.data
  },

  async updateMe(profileData: UpdateOwnerProfileDto): Promise<Owner> {
    const response = await api.put('/owners/me', profileData)
    return response.data
  },

  async getPets(ownerId: string = 'me'): Promise<Pet[]> {
    const response = await api.get(`/owners/${ownerId}/pets`)
    return response.data
  },

  async getAllPets(): Promise<Pet[]> {
    const response = await api.get('/owners/pets')
    return response.data
  },

  async getVeterinarians(): Promise<VeterinarianOption[]> {
    const response = await api.get('/owners/vets')
    return response.data
  },

  async createPet(petData: CreatePetDto): Promise<Pet> {
    const response = await api.post('/owners/me/pets', petData)
    return response.data
  },

  async updatePet(petId: string, petData: Partial<CreatePetDto>): Promise<Pet> {
    const response = await api.put(`/owners/me/pets/${petId}`, petData)
    return response.data
  },

  async deletePet(petId: string): Promise<void> {
    await api.delete(`/owners/me/pets/${petId}`)
  },

  async getPetHealthRecords(petId: string): Promise<any> {
    const response = await api.get(`/owners/me/pets/${petId}/health-records`)
    return response.data
  }
}