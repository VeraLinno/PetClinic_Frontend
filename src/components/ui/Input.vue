<template>
  <div class="relative space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
    <p v-if="error" class="text-sm text-danger-600 dark:text-danger-400">
      {{ error }}
    </p>
    <p v-else-if="helpText" class="text-sm text-slate-500 dark:text-slate-400">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props {
  id?: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  helpText?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  modelValue: ''
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const inputClasses = computed(() => {
  const base = 'block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60'

  if (props.error) {
    return `${base} border-danger-400 bg-danger-50 focus:ring-danger-500 dark:border-danger-600 dark:bg-danger-950/20`
  }

  return `${base} border-slate-300 focus:ring-primary-500 dark:border-slate-600`
})
</script>
