<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

defineEmits<{
  click: []
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary dark:focus:ring-offset-gray-800',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 dark:focus:ring-offset-gray-800',
    danger: 'bg-danger hover:bg-danger-hover text-white focus:ring-danger dark:focus:ring-offset-gray-800',
    success: 'bg-success hover:bg-success-hover text-white focus:ring-success dark:focus:ring-offset-gray-800',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary bg-transparent dark:border-primary-light dark:text-primary-light',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return `${base} ${variants[props.variant]} ${sizes[props.size]}`
})
</script>
