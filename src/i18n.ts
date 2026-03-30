import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import et from './locales/et.json'
import ru from './locales/ru.json'

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

export default i18n

// Helper function to set language and persist preference
export function setLanguage(lang: string) {
  const validLanguages: (keyof typeof messages)[] = ['en', 'et', 'ru']
  if (!validLanguages.includes(lang as keyof typeof messages)) {
    console.warn(`Language "${lang}" is not supported. Using "en" instead.`)
    lang = 'en'
  }
  if (i18n.global.locale) {
    (i18n.global.locale as any).value = lang
    localStorage.setItem('language', lang)
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
