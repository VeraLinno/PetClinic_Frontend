import api from './api'

export interface VetCleanupCandidate {
  vetAccountId: string
  email: string
  firstName: string
  lastName: string
  licenseNumber: string
  createdAtUtc?: string
  createdByEmail: string
  reason: string
  appointmentCount: number
  activeRefreshTokenCount: number
}

export interface VetCleanupDryRunResponse {
  candidates: VetCleanupCandidate[]
  totalCandidateCount: number
  totalProtectedCount: number
  totalAppointmentsImpacted: number
  totalActiveTokensImpacted: number
  previewGeneratedAtUtc: string
  previewHash: string
  notes: string
}

export const vetCleanupService = {
  async previewCleanup(): Promise<VetCleanupDryRunResponse> {
    const response = await api.post('/admin/cleanup/vet-accounts/dry-run')
    return response.data
  }
}
