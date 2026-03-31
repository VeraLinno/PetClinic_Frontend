import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import et from './locales/et.json'
import ru from './locales/ru.json'
import api from './services/api'

const messages = {
  en,
  et,
  ru
}

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages
})

// Flag to track if translations are loaded from database
let dbTranslationsLoaded = false

export default i18n

// Load translations from database API (exported for use in main.ts and setLanguage)
export async function loadDbTranslations(languageCode: string): Promise<void> {
  try {
    const response = await api.get(`/translations/language/${languageCode}`)
    
    // Check if response is successful and has valid data structure
    if (!response || !response.data) {
      console.warn(`No translation data received for language: ${languageCode}`)
      return
    }
    
    const data = response.data as any
    
    // Validate that we have translation data
    if (!data.translations || typeof data.translations !== 'object') {
      console.warn(`Invalid translation data format for language: ${languageCode}`)
      return
    }
    
    const currentMessages = i18n.global.messages as any
    
    // Initialize language object if it doesn't exist
    if (!currentMessages[languageCode]) {
      currentMessages[languageCode] = {}
    }
    
    // Merge database translations with existing messages
    for (const [category, translations] of Object.entries(data.translations)) {
      if (typeof translations === 'object') {
        currentMessages[languageCode] = {
          ...currentMessages[languageCode],
          [category]: translations
        }
      }
    }
    
    dbTranslationsLoaded = true
    console.log(`Loaded translations from database for ${languageCode}`)
  } catch (error: any) {
    // Silently fail with detailed logging
    const errorMessage = error?.message || 'Unknown error'
    const errorStatus = error?.response?.status || 'N/A'
    console.warn(
      `Failed to load translations from database for ${languageCode} (Status: ${errorStatus}): ${errorMessage}. Using local files as fallback.`
    )
    // Continue gracefully - local translations will be used as fallback
  }
}

// Helper function to set language and persist preference
export async function setLanguage(lang: string) {
  const validLanguages: (keyof typeof messages)[] = ['en', 'et', 'ru']
  if (!validLanguages.includes(lang as keyof typeof messages)) {
    console.warn(`Language "${lang}" is not supported. Using "en" instead.`)
    lang = 'en'
  }
  
  // Set the locale with type cast since we've already validated it
  i18n.global.locale.value = lang as keyof typeof messages
  localStorage.setItem('language', lang)
  
  // Try to load translations from database
  await loadDbTranslations(lang)
}

// Get current language
export function getCurrentLanguage() {
  return i18n.global.locale.value || 'en'
}

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
]

// Load translations from database for the saved language on initialization
// This will silently fail and use local translations as fallback if the API is unavailable
loadDbTranslations(savedLanguage).catch(() => {
  // Silently ignore errors - local translations are used as fallback
})
