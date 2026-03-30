<template>
  <Card class="group transition-all duration-200 hover:border-primary-300 hover:shadow-card-hover dark:hover:border-primary-700/60" hoverable>
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl ring-2 ring-primary-200 dark:bg-primary-900/30 dark:ring-primary-700/40"
          aria-hidden="true"
        >
          <span>{{ petEmoji }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <h3 class="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{ pet.name }}
            </h3>
            <Badge :variant="speciesBadge.variant" size="sm">{{ speciesBadge.label }}</Badge>
          </div>

          <p class="truncate text-sm text-slate-500 dark:text-slate-400">
            {{ pet.breedLocalized || pet.breed || 'Mixed Breed' }}
          </p>

          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Born: {{ formatDate(pet.dateOfBirth) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          size="sm"
          class="col-span-2"
          @click="$emit('book-appointment', pet)"
          :aria-label="`Book appointment for ${pet.name}`"
        >
          Book Appointment
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="w-full"
          :aria-label="`View details for ${pet.name}`"
        >
          Details
        </Button>

        <Button
          variant="danger"
          size="sm"
          class="w-full"
          :aria-label="`Delete ${pet.name}`"
          @click="$emit('delete-pet', pet)"
        >
          Delete
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Pet } from '@/services/owners'

const props = defineProps<{
  pet: Pet
}>()

defineEmits<{
  'book-appointment': [pet: Pet]
  'delete-pet': [pet: Pet]
}>()

const petEmoji = computed(() => {
  if (!props.pet) return '🐾'
  const species = props.pet.species.toLowerCase()
  if (species.includes('dog')) return '🐕'
  if (species.includes('cat')) return '🐱'
  if (species.includes('bird')) return '🐦'
  if (species.includes('fish')) return '🐠'
  if (species.includes('rabbit')) return '🐰'
  if (species.includes('hamster')) return '🐹'
  return '🐾'
})

const speciesBadge = computed(() => {
  const speciesLabel = props.pet.speciesLocalized || props.pet.species
  const species = props.pet.species.toLowerCase()
  if (species.includes('dog')) return { label: speciesLabel, variant: 'info' as const }
  if (species.includes('cat')) return { label: speciesLabel, variant: 'primary' as const }
  if (species.includes('bird')) return { label: speciesLabel, variant: 'warning' as const }
  if (species.includes('rabbit')) return { label: speciesLabel, variant: 'success' as const }
  return { label: speciesLabel, variant: 'default' as const }
})

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return 'Invalid date'
  }
}
</script>
