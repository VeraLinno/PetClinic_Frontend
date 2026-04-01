import { useAuthStore } from '@/stores/auth'

type SandboxPet = {
  id: string
  name: string
  species: string
  speciesLocalized?: string
  breed: string
  breedLocalized?: string
  dateOfBirth: string
  ownerId: string
}

type SandboxAppointment = {
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

type SandboxVisit = {
  id: string
  appointmentId: string
  notes: string
  diagnosis?: string
  treatments?: string[]
}

type SandboxInvoice = {
  id: string
  visitId: string
  items: Array<{ description: string; quantity: number; price: number }>
  total: number
  status: 'Paid' | 'Pending' | 'Overdue'
  createdAt: string
}

type SandboxUnavailability = {
  id: string
  veterinarianId: string
  startDate: string
  endDate: string
  reason?: string
}

type SandboxOwner = {
  id: string
  email: string
  firstName: string
  lastName: string
}

type SandboxState = {
  owner: SandboxOwner
  pets: SandboxPet[]
  appointments: SandboxAppointment[]
  visits: SandboxVisit[]
  invoices: SandboxInvoice[]
  unavailability: SandboxUnavailability[]
}

const STORAGE_KEY = 'petclinic.adminSandbox.v1'
const SANDBOX_OWNER_ID = 'sandbox-owner'
const SANDBOX_VET_ID = 'sandbox-vet'

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getDefaultState(): SandboxState {
  return {
    owner: {
      id: SANDBOX_OWNER_ID,
      email: 'sandbox.owner@petclinic.local',
      firstName: 'Sandbox',
      lastName: 'Owner'
    },
    pets: [],
    appointments: [],
    visits: [],
    invoices: [],
    unavailability: []
  }
}

function readState(): SandboxState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as Partial<SandboxState>
    return {
      ...getDefaultState(),
      ...parsed,
      owner: {
        ...getDefaultState().owner,
        ...(parsed.owner || {})
      },
      pets: parsed.pets || [],
      appointments: parsed.appointments || [],
      visits: parsed.visits || [],
      invoices: parsed.invoices || [],
      unavailability: parsed.unavailability || []
    }
  } catch {
    return getDefaultState()
  }
}

function writeState(state: SandboxState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isAdminSandboxMode(): boolean {
  const authStore = useAuthStore()
  const baseRoles = authStore.user?.roles || []
  return authStore.isAuthenticated && baseRoles.includes('Admin') && (authStore.adminViewMode || 'admin') !== 'admin'
}

export const adminSandbox = {
  getOwner() {
    return readState().owner
  },

  updateOwner(payload: { email: string; firstName?: string; lastName?: string }) {
    const state = readState()
    state.owner = {
      ...state.owner,
      email: payload.email,
      firstName: payload.firstName || '',
      lastName: payload.lastName || ''
    }
    writeState(state)
    return state.owner
  },

  getPets() {
    return readState().pets
  },

  createPet(payload: { name: string; species: string; breed: string; dateOfBirth: string }) {
    const state = readState()
    const pet: SandboxPet = {
      id: makeId('pet'),
      ownerId: SANDBOX_OWNER_ID,
      name: payload.name,
      species: payload.species,
      breed: payload.breed,
      dateOfBirth: payload.dateOfBirth
    }
    state.pets.push(pet)
    writeState(state)
    return pet
  },

  updatePet(petId: string, payload: Partial<{ name: string; species: string; breed: string; dateOfBirth: string }>) {
    const state = readState()
    const index = state.pets.findIndex((p) => p.id === petId)
    if (index === -1) {
      throw new Error('Pet not found')
    }

    state.pets[index] = {
      ...state.pets[index],
      ...payload
    }
    writeState(state)
    return state.pets[index]
  },

  deletePet(petId: string) {
    const state = readState()
    state.pets = state.pets.filter((p) => p.id !== petId)
    state.appointments = state.appointments.filter((a) => a.petId !== petId)
    writeState(state)
  },

  getVeterinarians() {
    return [
      {
        id: SANDBOX_VET_ID,
        name: 'Sandbox Vet',
        email: 'sandbox.vet@petclinic.local'
      }
    ]
  },

  getAppointments(params?: { ownerId?: string; vetId?: string; date?: string; status?: string }) {
    const state = readState()
    let items = [...state.appointments]

    if (params?.ownerId) {
      items = items.filter((a) => a.ownerId === params.ownerId)
    }
    if (params?.vetId) {
      items = items.filter((a) => a.veterinarianId === params.vetId)
    }
    if (params?.date) {
      items = items.filter((a) => a.startAt.startsWith(params.date as string))
    }
    if (params?.status) {
      items = items.filter((a) => a.status.toLowerCase() === String(params.status).toLowerCase())
    }

    return items
  },

  createAppointment(payload: Partial<SandboxAppointment>) {
    const state = readState()
    const pet = state.pets.find((p) => p.id === payload.petId)
    const startAt = payload.startAt || new Date().toISOString()
    const endAt = payload.endAt || new Date(new Date(startAt).getTime() + 30 * 60 * 1000).toISOString()

    const appointment: SandboxAppointment = {
      id: makeId('appt'),
      petId: payload.petId || makeId('pet-missing'),
      petName: pet?.name || payload.petName,
      ownerId: SANDBOX_OWNER_ID,
      ownerName: `${state.owner.firstName} ${state.owner.lastName}`.trim(),
      veterinarianId: payload.veterinarianId || SANDBOX_VET_ID,
      veterinarianName: payload.veterinarianName || 'Sandbox Vet',
      startAt,
      endAt,
      dateTime: startAt,
      status: payload.status || 'Pending',
      notes: payload.notes
    }

    state.appointments.push(appointment)
    writeState(state)
    return appointment
  },

  updateAppointmentStatus(id: string, status: SandboxAppointment['status']) {
    const state = readState()
    const appt = state.appointments.find((a) => a.id === id)
    if (!appt) {
      throw new Error('Appointment not found')
    }
    appt.status = status
    writeState(state)
    return appt
  },

  getAppointmentById(id: string) {
    return readState().appointments.find((a) => a.id === id) || null
  },

  getVisit(id: string) {
    const state = readState()
    const byVisit = state.visits.find((v) => v.id === id)
    if (byVisit) return byVisit
    return state.visits.find((v) => v.appointmentId === id) || null
  },

  completeVisit(appointmentOrVisitId: string, payload: { notes?: string; diagnosis?: string; treatments?: string[] }) {
    const state = readState()
    const appointment = state.appointments.find((a) => a.id === appointmentOrVisitId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    appointment.status = 'Completed'

    const visit: SandboxVisit = {
      id: makeId('visit'),
      appointmentId: appointment.id,
      notes: payload.notes || '',
      diagnosis: payload.diagnosis,
      treatments: payload.treatments || []
    }
    state.visits.push(visit)

    const invoice: SandboxInvoice = {
      id: makeId('inv'),
      visitId: visit.id,
      items: [
        {
          description: 'Consultation',
          quantity: 1,
          price: 50
        }
      ],
      total: 50,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
    state.invoices.push(invoice)

    writeState(state)
    return visit
  },

  getInvoice(visitId: string) {
    return readState().invoices.find((i) => i.visitId === visitId) || null
  },

  payInvoice(invoiceId: string) {
    const state = readState()
    const invoice = state.invoices.find((i) => i.id === invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }
    invoice.status = 'Paid'
    writeState(state)
    return invoice
  },

  getVetUnavailability() {
    return readState().unavailability
  },

  addVetUnavailability(startDate: string, endDate: string, reason?: string) {
    const state = readState()
    const record: SandboxUnavailability = {
      id: makeId('unavail'),
      veterinarianId: SANDBOX_VET_ID,
      startDate,
      endDate,
      reason
    }
    state.unavailability.push(record)
    writeState(state)
    return record
  },

  deleteVetUnavailability(id: string) {
    const state = readState()
    state.unavailability = state.unavailability.filter((u) => u.id !== id)
    writeState(state)
  },

  updateVetUnavailability(id: string, startDate: string, endDate: string, reason?: string) {
    const state = readState()
    const target = state.unavailability.find((u) => u.id === id)
    if (!target) {
      throw new Error('Unavailability not found')
    }

    target.startDate = startDate
    target.endDate = endDate
    target.reason = reason
    writeState(state)
    return target
  }
}
