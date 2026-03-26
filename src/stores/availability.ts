import { defineStore } from 'pinia'
import { appointmentsService } from '@/services/appointments'

export interface UnavailablePeriod {
  id: string
  veterinarianId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  reason?: string
}

interface AvailabilityState {
  unavailablePeriods: UnavailablePeriod[]
  loading: boolean
  error: string | null
}

export const useAvailabilityStore = defineStore('availability', {
  state: (): AvailabilityState => ({
    unavailablePeriods: [],
    loading: false,
    error: null
  }),

  getters: {
    isDateUnavailable: (state) => (date: string): boolean => {
      return state.unavailablePeriods.some(
        (period) => date >= period.startDate && date <= period.endDate
      )
    },

    getUnavailableDatesForMonth: (state) => (year: number, month: number): string[] => {
      const dates: string[] = []
      state.unavailablePeriods.forEach((period) => {
        const start = new Date(period.startDate)
        const end = new Date(period.endDate)

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() === month - 1) {
            const dateStr = d.toISOString().split('T')[0]
            dates.push(dateStr)
          }
        }
      })
      return dates
    }
  },

  actions: {
    async fetchUnavailablePeriods() {
      this.loading = true
      this.error = null
      try {
        const periods = await appointmentsService.getVetUnavailability()
        this.unavailablePeriods = periods
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to load unavailable periods'
        this.error = msg
        console.error('Error fetching unavailable periods:', err)
      } finally {
        this.loading = false
      }
    },

    async addUnavailablePeriod(startDate: string, endDate: string, reason?: string) {
      this.loading = true
      this.error = null
      try {
        const newPeriod = await appointmentsService.addVetUnavailability(startDate, endDate, reason)
        this.unavailablePeriods.push(newPeriod)
        return newPeriod
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to add unavailable period'
        this.error = msg
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteUnavailablePeriod(id: string) {
      this.loading = true
      this.error = null
      try {
        await appointmentsService.deleteVetUnavailability(id)
        this.unavailablePeriods = this.unavailablePeriods.filter((p) => p.id !== id)
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete unavailable period'
        this.error = msg
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
