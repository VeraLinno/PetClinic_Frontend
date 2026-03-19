<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @keydown.escape="$emit('close')"
        @keydown.tab="handleTab"
      >
        <div class="flex min-h-screen items-center justify-center px-4 py-6" ref="modalContainer">
          <!-- Overlay -->
          <div class="fixed inset-0 bg-slate-900/60 transition-opacity dark:bg-slate-900/80" @click="$emit('close')"></div>

          <!-- Modal Panel -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="isOpen"
              ref="modalPanel"
              class="relative inline-block w-full transform rounded-xl bg-white text-left shadow-overlay dark:bg-slate-800 sm:max-w-lg"
              @click.stop
            >
              <!-- Header -->
              <div v-if="title" class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h3 :id="titleId" class="text-lg font-semibold text-slate-900 dark:text-white">
                  {{ title }}
                </h3>
                <button
                  @click="$emit('close')"
                  class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  aria-label="Close modal"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div :id="descriptionId" class="px-6 py-5">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`
const descriptionId = `modal-desc-${Math.random().toString(36).slice(2, 9)}`
const modalPanel = ref<HTMLElement | null>(null)
const previouslyFocusedElement = ref<HTMLElement | null>(null)

const getFocusableElements = () => {
  if (!modalPanel.value) return []
  return Array.from(
    modalPanel.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

const handleTab = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  const focusables = getFocusableElements()
  if (focusables.length === 0) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

// Focus trap
watch(() => props.isOpen, async (open) => {
  if (open) {
    previouslyFocusedElement.value = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    await nextTick()
    const focusable = getFocusableElements()[0]
    focusable?.focus()
  } else {
    document.body.style.overflow = ''
    previouslyFocusedElement.value?.focus()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
