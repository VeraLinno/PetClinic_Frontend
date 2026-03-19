<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
      <slot name="header" />
    </div>
    <div class="px-6 py-6">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'sm',
  rounded: true,
  hoverable: false
})

const cardClasses = computed(() => {
  const base = 'border border-slate-200 bg-white transition-all duration-200 dark:border-slate-700 dark:bg-slate-800'

  const shadows: Record<string, string> = {
    none: '',
    sm: 'shadow-card',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const rounded = props.rounded ? 'rounded-xl' : ''
  const hover = props.hoverable ? 'cursor-pointer hover:border-slate-300 hover:shadow-card-hover dark:hover:border-slate-600' : ''

  return `${base} ${shadows[props.shadow]} ${rounded} ${hover}`
})
</script>
