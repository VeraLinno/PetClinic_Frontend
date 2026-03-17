<template>
  <span
    :class="badgeClasses"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :role="ariaRole"
    :aria-label="ariaLabel"
  >
    <span v-if="dot" class="mr-1.5 w-1.5 h-1.5 rounded-full" :class="dotClasses"></span>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  dot?: boolean
  outline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  label: '',
  dot: false,
  outline: false
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
  }
  return variants[props.variant]
})

const outlineVariantClasses = computed(() => {
  const variants = {
    default: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    primary: 'border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400',
    success: 'border border-green-300 text-green-700 dark:border-green-600 dark:text-green-400',
    warning: 'border border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400',
    danger: 'border border-red-300 text-red-700 dark:border-red-600 dark:text-red-400',
    info: 'border border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }
  return sizes[props.size]
})

const dotClasses = computed(() => {
  const variants = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-indigo-500'
  }
  return variants[props.variant]
})

const badgeClasses = computed(() => {
  return props.outline ? outlineVariantClasses.value : variantClasses.value
})

const ariaRole = computed(() => {
  return props.variant === 'danger' || props.variant === 'warning' ? 'alert' : 'status'
})

const ariaLabel = computed(() => {
  return props.label ? props.label : undefined
})
</script>
