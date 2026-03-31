<template>
  <div class="space-y-2">
    <nav class="hidden items-center text-sm sm:flex" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li>
          <RouterLink
            :to="homePath"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <HomeIcon class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('common.home') }}</span>
          </RouterLink>
        </li>

        <li
          v-for="(item, index) in normalizedItems"
          :key="`${item.label}-${index}`"
          class="inline-flex items-center gap-2"
        >
          <ChevronRightIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
          <RouterLink
            v-if="item.to && index < normalizedItems.length - 1"
            :to="item.to"
            class="rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else class="rounded-md px-2 py-1 text-slate-900 dark:text-slate-100">
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>

    <nav class="flex items-center text-sm sm:hidden" aria-label="Breadcrumb Mobile">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li>
          <RouterLink
            :to="homePath"
            class="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <HomeIcon class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('common.home') }}</span>
          </RouterLink>
        </li>

        <li v-if="currentItem" class="inline-flex items-center gap-2">
          <ChevronRightIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span class="rounded-md px-2 py-1 text-slate-900 dark:text-slate-100">
            {{ currentItem.label }}
          </span>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/24/outline'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items?: BreadcrumbItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const route = useRoute()
const { t } = useI18n()

const homePath = computed(() => {
  if (route.path.startsWith('/vet')) return '/vet'
  if (route.path.startsWith('/owner')) return '/owner'
  return '/'
})

const normalizedItems = computed(() => {
  if (props.items.length > 0) return props.items

  return route.matched
    .filter((m) => m.path !== '/')
    .map((m) => ({
      label: (m.name as string) || m.path,
      to: m.path
    }))
})

const currentItem = computed(() => {
  if (normalizedItems.value.length === 0) return null
  return normalizedItems.value[normalizedItems.value.length - 1]
})
</script>
