<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div
        :class="toastClasses"
        role="alert"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="text-lg">{{ iconText }}</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">
              {{ message }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <button
              @click="$emit('close')"
              class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="closeButtonClasses"
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)

const toastClasses = computed(() => {
  const base = 'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg p-4 shadow-lg ring-1 ring-black ring-opacity-5'

  const types = {
    success: 'bg-green-50 border-l-4 border-green-400 text-green-800',
    error: 'bg-red-50 border-l-4 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-800'
  }

  return `${base} ${types[props.type]}`
})

const closeButtonClasses = computed(() => {
  const types = {
    success: 'text-green-500 hover:bg-green-200 focus:ring-green-600',
    error: 'text-red-500 hover:bg-red-200 focus:ring-red-600',
    warning: 'text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-600',
    info: 'text-blue-500 hover:bg-blue-200 focus:ring-blue-600'
  }

  return types[props.type]
})

const iconText = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return icons[props.type]
})

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      isVisible.value = false
      emit('close')
    }, props.duration)
  }
})
</script>