<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 lg:grid lg:grid-cols-2">
    <section class="relative hidden overflow-hidden bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -top-8 right-10 h-44 w-44 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
      <div class="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium ring-1 ring-white/20">
          {{ $t('auth.registerAsOwner').split(' ').slice(0, 2).join(' ') }}
        </div>
        <h1 class="mt-8 text-4xl font-semibold leading-tight">{{ $t('common.register') }}</h1>
        <p class="mt-4 max-w-md text-base text-white/90">
          {{ $t('auth.petOwner') }}
        </p>
      </div>

      <ul class="space-y-4 text-sm text-white/95">
        <li class="flex items-center gap-3">
          <CheckBadgeIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('appointments.title') }}
        </li>
        <li class="flex items-center gap-3">
          <CheckBadgeIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('appointments.scheduled') }}
        </li>
        <li class="flex items-center gap-3">
          <CheckBadgeIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('invoices.title') }}
        </li>
      </ul>
    </section>

    <section class="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-8 text-center">
          <p class="label-upper text-secondary-700 dark:text-secondary-300">{{ $t('common.register') }}</p>
          <h2 class="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{{ $t('common.register') }}</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ $t('forms.pleaseWait') }}</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div class="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              v-model="form.firstName"
              type="text"
              :label="$t('auth.firstName')"
              placeholder="Alex"
              :disabled="loading"
              required
            />
            <Input
              id="lastName"
              v-model="form.lastName"
              type="text"
              :label="$t('auth.lastName')"
              placeholder="Morgan"
              :disabled="loading"
              required
            />
          </div>

          <Input
            id="email"
            v-model="form.email"
            type="email"
            :label="$t('auth.email')"
            placeholder="you@clinic.com"
            :disabled="loading"
            required
          />

          <Input
            id="password"
            v-model="form.password"
            type="password"
            :label="$t('auth.password')"
            placeholder="Create a secure password"
            :disabled="loading"
            required
            help-text="Use at least 8 characters."
          />

          <label class="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <input
              v-model="acceptTerms"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              :disabled="loading"
            />
            <span>
              {{ $t('auth.registrationSuccess') }}
            </span>
          </label>

          <div v-if="error" class="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
            {{ error }}
          </div>

          <Button type="submit" variant="primary" size="lg" class="w-full" :loading="loading">
            {{ loading ? $t('forms.pleaseWait') : $t('common.register') }}
          </Button>

          <p class="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            {{ $t('auth.haveAccount') }}
            <router-link to="/login" class="font-medium text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200">
              {{ $t('auth.loginHere') }}
            </router-link>
          </p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckBadgeIcon } from '@heroicons/vue/24/outline'
import { authService } from '@/services/auth'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const acceptTerms = ref(false)
const router = useRouter()

const handleRegister = async () => {
  if (!acceptTerms.value) {
    error.value = 'Please accept the terms to continue.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await authService.register(form.value.email, form.value.password, form.value.firstName, form.value.lastName, ['Owner'])
    router.push('/login')
  } catch (err: any) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>