<template>
  <div>
    <div role="tablist" class="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" @keydown="onKeydown">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :id="`tab-${tab.value}`"
        role="tab"
        :tabindex="activeTab === tab.value ? 0 : -1"
        :aria-selected="activeTab === tab.value"
        :aria-controls="`panel-${tab.value}`"
        :class="tabButtonClass(tab.value)"
        @click="setActive(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-4">
      <section
        v-for="tab in tabs"
        :id="`panel-${tab.value}`"
        :key="tab.value"
        role="tabpanel"
        :aria-labelledby="`tab-${tab.value}`"
        :hidden="activeTab !== tab.value"
      >
        <slot :name="tab.value" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TabItem {
  label: string
  value: string
}

interface Props {
  modelValue?: string
  tabs: TabItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed(() => props.modelValue ?? props.tabs[0]?.value ?? '')

const setActive = (value: string) => {
  emit('update:modelValue', value)
}

const onKeydown = (event: KeyboardEvent) => {
  const currentIndex = props.tabs.findIndex((tab) => tab.value === activeTab.value)
  if (currentIndex === -1 || props.tabs.length === 0) return

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextIndex = (currentIndex + 1) % props.tabs.length
    setActive(props.tabs[nextIndex].value)
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevIndex = (currentIndex - 1 + props.tabs.length) % props.tabs.length
    setActive(props.tabs[prevIndex].value)
  }
}

const tabButtonClass = (value: string) => {
  const common = 'inline-flex min-w-0 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500'
  const active = 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
  const inactive = 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'

  return `${common} ${activeTab.value === value ? active : inactive}`
}
</script>
