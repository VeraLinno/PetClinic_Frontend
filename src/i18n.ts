import { createI18n } from 'vue-i18n'
import { baseCompile } from '@intlify/message-compiler'
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

function sanitizeTranslationNode(node: unknown, path: string): unknown {
  if (typeof node === 'string') {
    try {
      // Validate ICU/Vue-i18n message syntax before adding DB strings.
      baseCompile(node, { mode: 'normal' })
      return node
    } catch {
      console.debug(`Skipping invalid translation message at ${path}`)
      return undefined
    }
  }

  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return undefined
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const sanitized = sanitizeTranslationNode(value, `${path}.${key}`)
    if (sanitized !== undefined) {
      result[key] = sanitized
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

// Load translations from database API (exported for use in main.ts and setLanguage)
export async function loadDbTranslations(languageCode: string): Promise<void> {
  try {
    const response = await api.get(`/translations/language/${languageCode}`)
    
    // Check HTTP status before processing
    if (!response || response.status >= 400) {
      console.debug(`Translation API returned status ${response?.status || 'unknown'} for ${languageCode}`)
      return
    }
    
    // Check if response is successful and has valid data structure
    if (!response.data) {
      console.debug(`No translation data received for language: ${languageCode}`)
      return
    }
    
    const data = response.data as any
    
    // Validate that we have translation data
    if (!data.translations || typeof data.translations !== 'object') {
      console.debug(`Invalid translation data format for language: ${languageCode}`)
      return
    }
    
    const currentMessages = i18n.global.messages as any
    
    // Initialize language object if it doesn't exist
    if (!currentMessages[languageCode]) {
      currentMessages[languageCode] = {}
    }
    
    // Merge database translations with existing messages
    for (const [category, translations] of Object.entries(data.translations)) {
      const sanitizedCategory = sanitizeTranslationNode(translations, category)
      if (sanitizedCategory && typeof sanitizedCategory === 'object') {
        currentMessages[languageCode] = {
          ...currentMessages[languageCode],
          [category]: sanitizedCategory
        }
      }
    }
    
    dbTranslationsLoaded = true
    console.debug(`Loaded translations from database for ${languageCode}`)
  } catch (error: any) {
    // Log error details for debugging but don't break the app
    const errorMessage = error?.message || 'Unknown error'
    const errorStatus = error?.response?.status
    
    // Only log actual errors, not network failures (401, 403, 503, etc.)
    if (errorStatus && (errorStatus === 401 || errorStatus === 403 || errorStatus >= 500)) {
      console.debug(
        `Translation API unavailable (${errorStatus}). Using local translations for ${languageCode}.`
      )
    } else if (!errorStatus) {
      // Network or other errors
      console.debug(`Could not load translations from database: ${errorMessage}`)
    }
    
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
