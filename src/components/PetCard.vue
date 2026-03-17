<template>
  <Card class="hover:shadow-card-hover transition-shadow duration-200">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <!-- Pet Avatar -->
      <div class="flex-shrink-0">
        <div 
          class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="text-2xl">{{ petEmoji }}</span>
        </div>
      </div>
      
      <!-- Pet Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ pet.name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ pet.species }} • {{ pet.breed }}
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Born: {{ formatDate(pet.dateOfBirth) }}
        </p>
      </div>
      
      <!-- Action Button -->
      <div class="flex-shrink-0 w-full sm:w-auto">
        <Button
          variant="primary"
          size="sm"
          class="w-full sm:w-auto"
          @click="$emit('book-appointment', pet)"
          :aria-label="`Book appointment for ${pet.name}`"
        >
          Book
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { Pet } from '@/services/owners'

const props = defineProps<{
  pet: Pet
}>()

defineEmits<{
  'book-appointment': [pet: Pet]
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

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return 'Invalid date'
  }
}
</script>
