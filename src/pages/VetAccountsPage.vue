<template>
  <div class="space-y-6">
    <Card>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ $t('vetAccounts.title') }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="loadVetAccounts">{{ $t('vetAccounts.refresh') }}</Button>
            <Button variant="primary" size="sm" @click="openCreateModal">{{ $t('vetAccounts.addAccount') }}</Button>
          </div>
        </div>
      </template>

      <div
        v-if="error"
        class="mb-4 rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300"
      >
        {{ error }}
      </div>

      <div
        v-if="successMessage"
        class="mb-4 rounded-lg border border-success-300 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-700 dark:bg-success-950/30 dark:text-success-300"
      >
        {{ successMessage }}
      </div>

      <div v-if="loading" class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.loading') }}</div>

      <div v-else-if="vetAccounts.length === 0" class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {{ $t('vetAccounts.noAccounts') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.name') }}</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.email') }}</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.license') }}</th>
              <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('vetAccounts.phone') }}</th>
              <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="account in vetAccounts" :key="account.id">
              <td class="px-3 py-3 text-sm text-slate-900 dark:text-slate-100">{{ account.firstName }} {{ account.lastName }}</td>
              <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ account.email }}</td>
              <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ account.licenseNumber }}</td>
              <td class="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{{ account.phoneNumber || '-' }}</td>
              <td class="px-3 py-3 text-right">
                <div class="inline-flex items-center gap-2">
                  <Button variant="outline" size="sm" @click="openEditModal(account)">{{ $t('common.edit') }}</Button>
                  <Button
                    v-if="canDeleteAccount(account)"
                    variant="danger"
                    size="sm"
                    @click="confirmDelete(account)"
                  >
                    {{ $t('common.delete') }}
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Modal :is-open="showCreateModal" :title="$t('vetAccounts.createTitle')" @close="closeCreateModal">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input v-model="createForm.firstName" :label="$t('auth.firstName')" placeholder="Sarah" :disabled="saving" />
          <Input v-model="createForm.lastName" :label="$t('auth.lastName')" placeholder="Johnson" :disabled="saving" />
        </div>
        <Input v-model="createForm.email" type="email" :label="$t('auth.email')" placeholder="vet@petclinic.com" :disabled="saving" />
        <Input v-model="createForm.password" type="password" :label="$t('auth.password')" :placeholder="$t('dashboard.vet.minimum8Chars')" :disabled="saving" />
        <Input v-model="createForm.licenseNumber" :label="$t('auth.licenseNumber')" placeholder="VET-1002" :disabled="saving" />
        <Input v-model="createForm.phoneNumber" type="tel" :label="`${$t('auth.phoneNumber')} (${$t('appointments.optional')})`" placeholder="+1 555 000 0000" :disabled="saving" />
        <p v-if="modalError" class="text-sm text-danger-600 dark:text-danger-400">{{ modalError }}</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="saving" @click="closeCreateModal">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" :loading="saving" @click="submitCreate">{{ $t('common.add') }}</Button>
        </div>
      </template>
    </Modal>

    <Modal :is-open="showEditModal" :title="$t('vetAccounts.editTitle')" @close="closeEditModal">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input v-model="editForm.firstName" :label="$t('auth.firstName')" :disabled="saving" />
          <Input v-model="editForm.lastName" :label="$t('auth.lastName')" :disabled="saving" />
        </div>
        <Input v-model="editForm.email" type="email" :label="$t('auth.email')" :disabled="saving" />
        <Input v-model="editForm.licenseNumber" :label="$t('auth.licenseNumber')" :disabled="saving" />
        <Input v-model="editForm.phoneNumber" type="tel" :label="`${$t('auth.phoneNumber')} (${$t('appointments.optional')})`" :disabled="saving" />
        <p v-if="modalError" class="text-sm text-danger-600 dark:text-danger-400">{{ modalError }}</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="saving" @click="closeEditModal">{{ $t('common.cancel') }}</Button>
          <Button variant="primary" :loading="saving" @click="submitEdit">{{ $t('common.save') }}</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Modal from '@/components/ui/Modal.vue'
import {
  vetAccountsService,
  type VetAccount
} from '@/services/vetAccounts'

const MAIN_VET_EMAIL = 'vet@petclinic.com'
const authStore = useAuthStore()
const { t } = useI18n()

const vetAccounts = ref<VetAccount[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const modalError = ref('')
const successMessage = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingId = ref('')

const createForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  licenseNumber: '',
  phoneNumber: ''
})

const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  licenseNumber: '',
  phoneNumber: ''
})

const loadVetAccounts = async () => {
  loading.value = true
  error.value = ''
  try {
    vetAccounts.value = await vetAccountsService.getAll()
  } catch (err: any) {
    error.value = err?.response?.data?.error || t('vetAccounts.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadVetAccounts()
})

const openCreateModal = () => {
  modalError.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  modalError.value = ''
  createForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    licenseNumber: '',
    phoneNumber: ''
  }
}

const openEditModal = (account: VetAccount) => {
  modalError.value = ''
  editingId.value = account.id
  editForm.value = {
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    licenseNumber: account.licenseNumber,
    phoneNumber: account.phoneNumber || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  modalError.value = ''
  editingId.value = ''
}

const validateCreate = () => {
  if (!createForm.value.firstName.trim() || !createForm.value.lastName.trim()) return t('vetAccounts.firstLastRequired')
  if (!createForm.value.email.trim()) return t('vetAccounts.emailRequired')
  if (createForm.value.password.length < 8) return t('vetAccounts.passwordTooShort')
  if (!createForm.value.licenseNumber.trim()) return t('vetAccounts.licenseRequired')
  return ''
}

const validateEdit = () => {
  if (!editForm.value.firstName.trim() || !editForm.value.lastName.trim()) return t('vetAccounts.firstLastRequired')
  if (!editForm.value.email.trim()) return t('vetAccounts.emailRequired')
  if (!editForm.value.licenseNumber.trim()) return t('vetAccounts.licenseRequired')
  return ''
}

const submitCreate = async () => {
  modalError.value = ''
  successMessage.value = ''

  const validationError = validateCreate()
  if (validationError) {
    modalError.value = validationError
    return
  }

  saving.value = true
  try {
    await vetAccountsService.create({
      firstName: createForm.value.firstName.trim(),
      lastName: createForm.value.lastName.trim(),
      email: createForm.value.email.trim(),
      password: createForm.value.password,
      licenseNumber: createForm.value.licenseNumber.trim(),
      phoneNumber: createForm.value.phoneNumber.trim() || undefined
    })
    closeCreateModal()
    successMessage.value = t('vetAccounts.createSuccess')
    await loadVetAccounts()
  } catch (err: any) {
    modalError.value = err?.response?.data?.error || t('vetAccounts.createFailed')
  } finally {
    saving.value = false
  }
}

const submitEdit = async () => {
  modalError.value = ''
  successMessage.value = ''

  const validationError = validateEdit()
  if (validationError) {
    modalError.value = validationError
    return
  }

  saving.value = true
  try {
    await vetAccountsService.update(editingId.value, {
      firstName: editForm.value.firstName.trim(),
      lastName: editForm.value.lastName.trim(),
      email: editForm.value.email.trim(),
      licenseNumber: editForm.value.licenseNumber.trim(),
      phoneNumber: editForm.value.phoneNumber.trim() || undefined
    })
    closeEditModal()
    successMessage.value = t('vetAccounts.updateSuccess')
    await loadVetAccounts()
  } catch (err: any) {
    modalError.value = err?.response?.data?.error || t('vetAccounts.updateFailed')
  } finally {
    saving.value = false
  }
}

const getCurrentUserId = () => {
  const currentUserRecord = (authStore.user || {}) as Record<string, unknown>
  return String(currentUserRecord.sub || currentUserRecord.id || '')
}

const isCurrentUserMainVet = () => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) {
    return false
  }

  const mainVetAccount = vetAccounts.value.find(
    (account) => account.email.toLowerCase() === MAIN_VET_EMAIL
  )

  return !!mainVetAccount && mainVetAccount.id === currentUserId
}

const canDeleteAccount = (account: VetAccount) => {
  const currentUserId = getCurrentUserId()
  const isMainVet = isCurrentUserMainVet()
  if (isMainVet) {
    return true
  }

  return currentUserId !== '' && currentUserId === account.id
}

const confirmDelete = async (account: VetAccount) => {
  modalError.value = ''
  successMessage.value = ''

  const confirmed = window.confirm(t('vetAccounts.confirmDelete'))
  if (!confirmed) {
    return
  }

  saving.value = true
  try {
    await vetAccountsService.delete(account.id)
    successMessage.value = t('vetAccounts.deleteSuccess', { email: account.email })
    await loadVetAccounts()
  } catch (err: any) {
    error.value = err?.response?.data?.error || t('vetAccounts.deleteFailed')
  } finally {
    saving.value = false
  }
}
</script>
