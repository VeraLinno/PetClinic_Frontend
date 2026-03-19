<template>
  <span
    :class="[badgeClasses, sizeClasses]"
    class="inline-flex items-center rounded-full font-medium leading-none"
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
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700/70 dark:text-slate-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }
  return variants[props.variant]
})

const outlineVariantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300',
    primary: 'border border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-300',
    success: 'border border-success-300 text-success-700 dark:border-success-600 dark:text-success-300',
    warning: 'border border-warning-300 text-warning-700 dark:border-warning-600 dark:text-warning-300',
    danger: 'border border-danger-300 text-danger-700 dark:border-danger-600 dark:text-danger-300',
    info: 'border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  return sizes[props.size]
})

const dotClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'bg-slate-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-blue-500'
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
