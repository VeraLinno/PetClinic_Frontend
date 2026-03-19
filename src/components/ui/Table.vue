<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead class="bg-slate-50 dark:bg-slate-900/40">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <button
              v-if="column.sortable"
              class="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-100"
              @click="handleSort(column.key)"
            >
              <span>{{ column.label }}</span>
              <span class="text-slate-400">↕</span>
            </button>
            <span v-else>{{ column.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowKeyValue(row, rowIndex)"
          class="transition-colors odd:bg-white even:bg-slate-50/50 hover:bg-slate-100/80 dark:odd:bg-slate-800 dark:even:bg-slate-800/70 dark:hover:bg-slate-700/60"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>

        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <slot name="empty">No records found.</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
}

interface TableRow {
  [key: string]: unknown
}

interface Props {
  columns: TableColumn[]
  rows: TableRow[]
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id'
})

const emit = defineEmits<{
  sort: [key: string]
}>()

const handleSort = (key: string) => {
  emit('sort', key)
}

const rowKeyValue = (row: TableRow, index: number) => {
  const value = row[props.rowKey]
  if (value === undefined || value === null) {
    return index
  }
  return String(value)
}
</script>
