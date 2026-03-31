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
    const data = response.data as { translations: Record<string, Record<string, Record<string, string>>> }
    
    if (data.translations) {
      const messagesRef = i18n.global.messages as any
      if (!messagesRef.value) {
        messagesRef.value = {}
      }
      
      // Merge database translations with existing messages
      for (const [category, translations] of Object.entries(data.translations)) {
        messagesRef.value[languageCode] = {
          ...messagesRef.value[languageCode],
          [category]: translations
        }
      }
      
      dbTranslationsLoaded = true
      console.log(`Loaded translations from database for ${languageCode}`)
    }
  } catch (error) {
    console.warn('Failed to load translations from database, using local files:', error)
  }
}

// Helper function to set language and persist preference
export async function setLanguage(lang: string) {
  const validLanguages: (keyof typeof messages)[] = ['en', 'et', 'ru']
  if (!validLanguages.includes(lang as keyof typeof messages)) {
    console.warn(`Language "${lang}" is not supported. Using "en" instead.`)
    lang = 'en'
  }
  
  if (i18n.global.locale) {
    (i18n.global.locale as any).value = lang
    localStorage.setItem('language', lang)
    
    // Try to load translations from database
    await loadDbTranslations(lang)
  }
}

// Get current language
export function getCurrentLanguage() {
  if (i18n.global.locale) {
    return i18n.global.locale.value
  }
  return 'en'
}

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
]

// Load translations from database for the saved language on initialization
loadDbTranslations(savedLanguage).catch(err => {
  console.warn('Failed to load translations from database on init:', err)
})
