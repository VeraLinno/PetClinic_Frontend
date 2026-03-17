<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
    <div v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id?: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  modelValue: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const inputClasses = computed(() => {
  const base = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'

  if (props.error) {
    return `${base} border-red-300 focus:ring-red-500 focus:border-red-500`
  }

  return base
})
</script>