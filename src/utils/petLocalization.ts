export type PetSpeciesKey =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'fish'
  | 'rabbit'
  | 'hamster'
  | 'reptile'
  | 'other'

export const normalizeTranslationKey = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const SPECIES_ALIASES: Record<PetSpeciesKey, string[]> = {
  dog: ['dog', 'koer', 'собака'],
  cat: ['cat', 'kass', 'кошка', 'кот'],
  bird: ['bird', 'lind', 'птица'],
  fish: ['fish', 'kala', 'рыба'],
  rabbit: ['rabbit', 'küülik', 'küülik', 'кролик'],
  hamster: ['hamster', 'хомяк'],
  reptile: ['reptile', 'roomaja', 'рептилия'],
  other: ['other', 'muu', 'другое']
}

const isLikelyTranslationKey = (value: string): boolean => {
  return /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(value.trim())
}

export const resolvePetSpeciesKey = (value: string): PetSpeciesKey | undefined => {
  const normalizedValue = value.trim().toLowerCase()

  for (const [speciesKey, aliases] of Object.entries(SPECIES_ALIASES) as [PetSpeciesKey, string[]][]) {
    if (aliases.includes(normalizedValue)) {
      return speciesKey
    }
  }

  return undefined
}

export const translatePetSpecies = (
  species: string,
  t: (key: string) => string,
  speciesLocalized?: string
): string => {
  const resolvedKey = resolvePetSpeciesKey(species)
  if (resolvedKey) {
    return t(`pets.species_${resolvedKey}`)
  }

  const key = `pets.species_${normalizeTranslationKey(species)}`
  const translated = t(key)
  if (translated !== key) {
    return translated
  }

  if (speciesLocalized && !isLikelyTranslationKey(speciesLocalized)) {
    return speciesLocalized
  }

  return species
}

export const translatePetBreed = (
  breed: string,
  t: (key: string) => string,
  breedLocalized?: string
): string => {
  const key = `pets.breed_${normalizeTranslationKey(breed)}`
  const translated = t(key)
  if (translated !== key) {
    return translated
  }

  if (breedLocalized && !isLikelyTranslationKey(breedLocalized)) {
    return breedLocalized
  }

  return breed
}
