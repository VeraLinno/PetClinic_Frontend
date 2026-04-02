<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
  >
    <slot v-if="!loading && $slots.leadingIcon" name="leadingIcon" />

    <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <span v-if="!iconOnly" class="whitespace-nowrap">
      <slot />
    </span>

    <slot v-if="!loading && $slots.trailingIcon" name="trailingIcon" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconOnly: false,
  type: 'button'
})

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-slate-900'

  const variants: Record<string, string> = {
    primary: 'bg-primary-500 text-white shadow-card hover:bg-primary-600 hover:shadow-card-hover active:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white shadow-card hover:bg-secondary-600 hover:shadow-card-hover active:bg-secondary-700 focus:ring-secondary-500',
    danger: 'bg-danger-600 text-white shadow-card hover:bg-danger-700 hover:shadow-card-hover active:bg-danger-800 focus:ring-danger-500',
    success: 'bg-success-500 text-white shadow-card hover:bg-success-600 hover:shadow-card-hover active:bg-success-700 focus:ring-success-500',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:border-primary-500 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-950/30',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700'
  }

  const sizes: Record<string, string> = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base'
  }

  const iconOnlySizes: Record<string, string> = {
    xs: 'h-8 w-8 p-0',
    sm: 'h-9 w-9 p-0',
    md: 'h-10 w-10 p-0',
    lg: 'h-11 w-11 p-0'
  }

  const sizing = props.iconOnly ? iconOnlySizes[props.size] : sizes[props.size]
  return `${base} ${variants[props.variant]} ${sizing}`
})
</script>
