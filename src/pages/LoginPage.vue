<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 lg:grid lg:grid-cols-2">
    <section class="relative hidden overflow-hidden bg-gradient-to-br from-primary-500 via-cyan-500 to-secondary-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -left-12 top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div class="absolute -bottom-10 right-8 h-44 w-44 rounded-full bg-white/10 blur-xl" aria-hidden="true" />

      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium ring-1 ring-white/20">
          Pet Clinic Platform
        </div>
        <h1 class="mt-8 text-4xl font-semibold leading-tight">{{ $t('auth.loginPortalTitle') }}</h1>
      </div>

      <ul class="space-y-4 text-sm text-white/95">
        <li class="flex items-center gap-3">
          <CheckCircleIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('appointments.title') }}
        </li>
        <li class="flex items-center gap-3">
          <CheckCircleIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('health.title') }}
        </li>
        <li class="flex items-center gap-3">
          <CheckCircleIcon class="h-5 w-5 text-white" aria-hidden="true" />
          {{ $t('admin.title') }}
        </li>
      </ul>
    </section>

    <section class="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-8 text-center">
          <h2 class="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{{ $t('common.login') }}</h2>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <Input
            id="email"
            v-model="email"
            type="email"
            :label="$t('auth.email')"
            placeholder="you@clinic.com"
            :disabled="loading"
            required
          />

          <Input
            id="password"
            v-model="password"
            type="password"
            :label="$t('auth.password')"
            :placeholder="$t('forms.pleaseWait')"
            :disabled="loading"
            required
          />

          <div v-if="error" class="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-700 dark:bg-danger-950/30 dark:text-danger-300">
            {{ error }}
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">{{ $t('auth.forgotPassword') }}</span>
          </div>

          <Button type="submit" variant="primary" size="lg" class="w-full" :loading="loading">
            {{ loading ? $t('forms.pleaseWait') : $t('common.login') }}
          </Button>

          <p class="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            {{ $t('auth.noAccount') }}
            <router-link to="/register" class="font-medium text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200">
              {{ $t('auth.registerHere') }}
            </router-link>
          </p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authService.login(email.value, password.value)

    const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : null
    if (redirectTarget) {
      router.push(redirectTarget)
      return
    }

    const userRoles = authStore.roles
    if (userRoles.includes('Vet')) {
      router.push('/vet')
    } else if (userRoles.includes('Owner')) {
      router.push('/owner')
    } else {
      router.push('/owner')
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>