<template>
  <div id="app">
    <MainLayout v-if="isAuthenticated && !isLoginRoute">
      <router-view />
    </MainLayout>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoginRoute = computed(() => route.path === '/login')
</script>

<style>
/* Global styles */
</style>