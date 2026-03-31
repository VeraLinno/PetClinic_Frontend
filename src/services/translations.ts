import api from './api'
import i18n, { setLanguage } from '@/i18n'

interface TranslationService {
  fetchTranslations(languageCode: string): Promise<void>
  getAvailableLanguages(): Promise<string[]>
  setLanguageWithTranslation(lang: string): Promise<void>
}

export const translationService: TranslationService = {
  /**
   * Fetch translations from the API and update i18n messages
   */
  async fetchTranslations(languageCode: string) {
    try {
      const response = await api.get(`/translations/language/${languageCode}`)
      const data = response.data as { translations: Record<string, Record<string, Record<string, string>>> }
      
      // Transform the API response into i18n message format
      const messages: Record<string, Record<string, string>> = {}
      
      if (data.translations) {
        for (const [category, translations] of Object.entries(data.translations)) {
          // Cast translations to the expected format
          messages[category] = translations as unknown as Record<string, string>
        }
      }
      
      // Merge with existing messages using any to avoid type issues
      const messagesRef = i18n.global.messages as any
      if (!messagesRef.value) {
        messagesRef.value = {}
      }
      messagesRef.value[languageCode] = messages
      
      console.log(`Loaded ${Object.keys(messages).length} translation categories for ${languageCode}`)
    } catch (error) {
      console.error('Failed to fetch translations:', error)
      throw error
    }
  },

  /**
   * Get available languages from the API
   */
  async getAvailableLanguages() {
    try {
      const response = await api.get('/translations/languages')
      return response.data as string[]
    } catch (error) {
      console.error('Failed to fetch available languages:', error)
      // Return default languages as fallback
      return ['en', 'et', 'ru']
    }
  },

  /**
   * Set language and fetch translations from the API
   */
  async setLanguageWithTranslation(lang: string) {
    try {
      // Fetch translations for the new language
      await translationService.fetchTranslations(lang)
      
      // Update i18n locale
      setLanguage(lang)
      
      console.log(`Language changed to ${lang} and translations loaded from database`)
    } catch (error) {
      console.error('Failed to set language with translations:', error)
      // Fallback to local translations
      setLanguage(lang)
    }
  }
}

export default translationService
