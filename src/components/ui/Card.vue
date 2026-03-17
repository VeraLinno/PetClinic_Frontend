<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header" />
    </div>
    <div class="px-6 py-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'md',
  rounded: true
})

const cardClasses = computed(() => {
  const base = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'

  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const rounded = props.rounded ? 'rounded-lg' : ''

  return `${base} ${shadows[props.shadow]} ${rounded}`
})
</script>
