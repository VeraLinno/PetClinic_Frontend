<template>
  <div :class="wrapperClasses" :aria-label="ariaLabel">
    <img
      v-if="src && !hasImageError"
      :src="src"
      :alt="alt"
      class="h-full w-full rounded-full object-cover"
      @error="onImageError"
    />

    <span
      v-else
      class="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100"
    >
      {{ fallbackInitials }}
    </span>

    <span
      v-if="status"
      :class="statusClasses"
      class="absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-900"
      aria-hidden="true"
    ></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  status?: 'online' | 'away' | 'busy' | 'offline'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: 'User avatar',
  initials: '',
  size: 'md'
})

const hasImageError = ref(false)

const onImageError = () => {
  hasImageError.value = true
}

const fallbackInitials = computed(() => {
  if (!props.initials) return '??'
  return props.initials.slice(0, 2).toUpperCase()
})

const wrapperClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base'
  }

  return `relative inline-flex shrink-0 items-center justify-center rounded-full ${sizes[props.size]}`
})

const statusClasses = computed(() => {
  const dotSize: Record<string, string> = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  }

  const statusColors: Record<string, string> = {
    online: 'bg-success-500',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
    offline: 'bg-slate-400 dark:bg-slate-500'
  }

  const status = props.status ?? 'offline'
  return `${dotSize[props.size]} ${statusColors[status]}`
})

const ariaLabel = computed(() => {
  if (props.status) {
    return `${props.alt} (${props.status})`
  }
  return props.alt
})
</script>
