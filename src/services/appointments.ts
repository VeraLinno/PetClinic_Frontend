import api from './api'
import { adminSandbox, isAdminSandboxMode } from './adminSandbox'

export interface Appointment {
  id: string
  petId: string
  petName?: string
  veterinarianId?: string | null
  veterinarianName?: string
  ownerId?: string
  ownerName?: string
  startAt: string
  endAt: string
  status: 'Pending' | 'Confirmed' | 'Scheduled' | 'Completed' | 'Cancelled'
  statusLocalized?: string
  notes?: string
  dateTime?: string
}

export interface Visit {
  id: string
  appointmentId: string
  notes: string
  status?: 'Open' | 'Completed'
  statusLocalized?: string
  diagnosis?: string
  treatments?: string[]
  prescriptions?: Prescription[]
  invoice?: Invoice
}

export interface Invoice {
  id: string
  visitId: string
  items: InvoiceItem[]
  total: number
  status: 'Paid' | 'Pending' | 'Overdue'
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

export interface Prescription {
  medication: string
  dosage: string
  quantity: number
  instructions?: string
}

export const appointmentsService = {
  async getAppointments(params?: { ownerId?: string; vetId?: string; date?: string; status?: string }) {
    if (isAdminSandboxMode()) {
      return adminSandbox.getAppointments(params)
    }
    const response = await api.get('/appointments', { params })
    return response.data
  },
  async createAppointment(appointment: Partial<Appointment>) {
    if (isAdminSandboxMode()) {
      return adminSandbox.createAppointment(appointment)
    }
    const response = await api.post('/appointments', appointment)
    return response.data
  },
  async updateAppointment(id: string, appointment: Partial<Appointment>) {
    const response = await api.put(`/appointments/${id}`, appointment)
    return response.data
  },
  async cancelAppointment(id: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.updateAppointmentStatus(id, 'Cancelled')
    }
    const response = await api.patch(`/appointments/${id}/cancel`)
    return response.data
  },
  async confirmAppointment(id: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.updateAppointmentStatus(id, 'Scheduled')
    }
    const response = await api.patch(`/appointments/${id}/confirm`)
    return response.data
  },
  async getAppointmentById(id: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.getAppointmentById(id)
    }
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },
  async getVisit(id: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.getVisit(id)
    }
    const response = await api.get(`/visits/${id}`)
    return response.data
  },
  async completeVisit(id: string, data: { notes?: string, diagnosis?: string, treatments?: string[], prescriptions?: Prescription[], invoiceAmount: number }) {
    if (isAdminSandboxMode()) {
      return adminSandbox.completeVisit(id, data)
    }
    const response = await api.patch(`/visits/${id}/complete`, data)
    return response.data
  },
  async getInvoice(visitId: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.getInvoice(visitId)
    }
    const response = await api.get(`/visits/${visitId}/invoice`)
    return response.data
  },
  async payInvoice(invoiceId: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.payInvoice(invoiceId)
    }
    const response = await api.post(`/invoices/${invoiceId}/pay`)
    return response.data
  },
  async getVetUnavailability() {
    if (isAdminSandboxMode()) {
      return adminSandbox.getVetUnavailability()
    }
    const response = await api.get('/vet/unavailability')
    return response.data
  },
  async addVetUnavailability(startDate: string, endDate: string, reason?: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.addVetUnavailability(startDate, endDate, reason)
    }
    const response = await api.post('/vet/unavailability', { startDate, endDate, reason })
    return response.data
  },
  async deleteVetUnavailability(id: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.deleteVetUnavailability(id)
    }
    const response = await api.delete(`/vet/unavailability/${id}`)
    return response.data
  },
  async updateVetUnavailability(id: string, startDate: string, endDate: string, reason?: string) {
    if (isAdminSandboxMode()) {
      return adminSandbox.updateVetUnavailability(id, startDate, endDate, reason)
    }
    const response = await api.put(`/vet/unavailability/${id}`, { startDate, endDate, reason })
    return response.data
  }
}