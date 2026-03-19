<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-8"
    >
      <div
        v-if="isVisible"
        class="pointer-events-auto fixed right-4 top-4 z-[60] w-full max-w-sm"
      >
        <div
          :class="toastClasses"
          role="alert"
          aria-live="assertive"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <component :is="iconComponent" class="w-5 h-5" aria-hidden="true" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-semibold">{{ message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button
                @click="dismiss"
                class="inline-flex rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="closeButtonClasses"
                aria-label="Dismiss notification"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted, h } from 'vue'

interface Props {
  show?: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'info',
  duration: 5000
})

const emit = defineEmits<{
  close: []
  'update:show': [value: boolean]
}>()

const isVisible = computed(() => props.show)

let timer: ReturnType<typeof setTimeout> | null = null

const startTimer = () => {
  clearTimer()
  if (props.duration > 0) {
    timer = setTimeout(() => {
      dismiss()
    }, props.duration)
  }
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const dismiss = () => {
  clearTimer()
  emit('update:show', false)
  emit('close')
}

watch(() => props.show, (val) => {
  if (val) startTimer()
  else clearTimer()
}, { immediate: true })

onUnmounted(() => {
  clearTimer()
})

const iconComponent = computed(() => {
  const icons = {
    success: {
      render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    },
    error: {
      render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    },
    warning: {
      render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
      ])
    },
    info: {
      render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
      ])
    }
  }
  return icons[props.type]
})

const toastClasses = computed(() => {
  const base = 'w-full overflow-hidden rounded-xl border-l-4 p-4 shadow-overlay'

  const types: Record<string, string> = {
    success: 'bg-success-50 dark:bg-success-950/30 border-success-500 text-success-800 dark:text-success-300',
    error: 'bg-danger-50 dark:bg-danger-950/30 border-danger-500 text-danger-800 dark:text-danger-300',
    warning: 'bg-warning-50 dark:bg-warning-950/30 border-warning-500 text-warning-800 dark:text-warning-300',
    info: 'bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-800 dark:text-primary-300'
  }

  return `${base} ${types[props.type]}`
})

const closeButtonClasses = computed(() => {
  const types: Record<string, string> = {
    success: 'text-success-500 hover:bg-success-100 dark:hover:bg-success-900/30 focus:ring-success-500',
    error: 'text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-900/30 focus:ring-danger-500',
    warning: 'text-warning-500 hover:bg-warning-100 dark:hover:bg-warning-900/30 focus:ring-warning-500',
    info: 'text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:ring-primary-500'
  }
  return types[props.type]
})
</script>
