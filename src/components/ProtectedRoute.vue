<template>
  <div v-if="isAuthenticated && hasRole">
    <slot />
  </div>
  <div v-else-if="!isAuthenticated" class="text-center py-8">
    <p class="text-gray-500">Please log in to access this page.</p>
    <router-link to="/login" class="text-blue-500 hover:text-blue-700">Go to Login</router-link>
  </div>
  <div v-else class="text-center py-8">
    <p class="text-gray-500">You don't have permission to access this page.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  roles?: string[]
}>()

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasRole = computed(() => {
  if (!props.roles) return true
  return props.roles.some(role => authStore.roles.includes(role))
})
</script>