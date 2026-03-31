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
            {{ breedLabel || $t('pets.breed_mixed_breed') }}
          </p>

          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {{ $t('pets.born') }}: {{ formatDate(pet.dateOfBirth) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          size="sm"
          class="col-span-2"
          @click="$emit('book-appointment', pet)"
          :aria-label="$t('pets.bookAppointment')"
        >
          {{ $t('pets.bookAppointment') }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="w-full"
          :aria-label="$t('common.details')"
        >
          {{ $t('common.details') }}
        </Button>

        <Button
          variant="danger"
          size="sm"
          class="w-full"
          :aria-label="$t('common.delete')"
          @click="$emit('delete-pet', pet)"
        >
          {{ $t('common.delete') }}
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Pet } from '@/services/owners'
import { resolvePetSpeciesKey, translatePetBreed, translatePetSpecies } from '@/utils/petLocalization'

const props = defineProps<{
  pet: Pet
}>()

const { t, locale } = useI18n()

defineEmits<{
  'book-appointment': [pet: Pet]
  'delete-pet': [pet: Pet]
}>()

const petEmoji = computed(() => {
  if (!props.pet) return '🐾'
  const speciesKey = resolvePetSpeciesKey(props.pet.species)
  if (speciesKey === 'dog') return '🐕'
  if (speciesKey === 'cat') return '🐱'
  if (speciesKey === 'bird') return '🐦'
  if (speciesKey === 'fish') return '🐠'
  if (speciesKey === 'rabbit') return '🐰'
  if (speciesKey === 'hamster') return '🐹'
  return '🐾'
})

const speciesBadge = computed(() => {
  const speciesLabel = translatePetSpecies(props.pet.species, t, props.pet.speciesLocalized)
  const speciesKey = resolvePetSpeciesKey(props.pet.species)
  if (speciesKey === 'dog') return { label: speciesLabel, variant: 'info' as const }
  if (speciesKey === 'cat') return { label: speciesLabel, variant: 'primary' as const }
  if (speciesKey === 'bird') return { label: speciesLabel, variant: 'warning' as const }
  if (speciesKey === 'rabbit') return { label: speciesLabel, variant: 'success' as const }
  return { label: speciesLabel, variant: 'default' as const }
})

const breedLabel = computed(() => translatePetBreed(props.pet.breed, t, props.pet.breedLocalized))

const formatDate = (date: string) => {
  if (!date) return t('common.notAvailable')
  try {
    return new Date(date).toLocaleDateString(locale.value || undefined)
  } catch {
    return t('common.invalidDate')
  }
}
</script>
