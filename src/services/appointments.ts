import api from './api'

export interface Appointment {
  id: string
  petId: string
  vetId: string
  ownerId: string
  date: string
  status: string
  notes?: string
}

export interface Visit {
  id: string
  appointmentId: string
  notes: string
  invoice?: any
}

export const appointmentsService = {
  async getAppointments(params?: { ownerId?: string; vetId?: string; date?: string }) {
    const response = await api.get('/appointments', { params })
    return response.data
  },
  async createAppointment(appointment: Omit<Appointment, 'id'>) {
    const response = await api.post('/appointments', appointment)
    return response.data
  },
  async updateAppointment(id: string, appointment: Partial<Appointment>) {
    const response = await api.put(`/appointments/${id}`, appointment)
    return response.data
  },
  async getVisit(id: string) {
    const response = await api.get(`/visits/${id}`)
    return response.data
  },
  async completeVisit(id: string, data: { notes: string }) {
    const response = await api.patch(`/visits/${id}/complete`, data)
    return response.data
  }
}