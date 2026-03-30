import api from './api'

export interface AdminDashboardMetrics {
  totalUsers: number
  totalVeterinarians: number
  totalPets: number
  totalAppointmentsThisMonth: number
  completedVisitsThisMonth: number
  totalRevenueThisMonth: number
  lowStockMedications: number
  generatedAt: string
}

export interface AdminSystemHealth {
  status: 'Healthy' | 'Warning' | 'Critical' | string
  checkedAt: string
  activeUsers: number
  databaseConnections: number
  cpuUsage: number
  memoryUsage: number
  issues?: string | null
}

export interface AdminUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  roles: string[]
  createdAt: string
  lastLoginAt?: string | null
  isActive: boolean
}

export interface AdminAppointment {
  id: string
  petId: string
  petName?: string | null
  ownerEmail?: string | null
  veterinarianId?: string | null
  veterinarianName?: string | null
  startAt: string
  endAt: string
  status: string
  statusLocalized?: string | null
}

const adminGet = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await api.get<T>(url, { params })
  return response.data
}

export const adminService = {
  getMetrics() {
    return adminGet<AdminDashboardMetrics>('/admin/admindashboard/metrics')
  },

  getHealth() {
    return adminGet<AdminSystemHealth>('/admin/admindashboard/health')
  },

  getUsers() {
    return adminGet<AdminUser[]>('/admin/adminusers/api/list')
  },

  getAppointments(params?: { fromDate?: string; toDate?: string; status?: string }) {
    return adminGet<AdminAppointment[]>('/admin/adminappointments/api/list', params)
  }
}
