import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { loadDbTranslations } from './i18n'
import { useAuthStore } from '@/stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

async function bootstrap() {
	const authStore = useAuthStore(pinia)
	await authStore.initializeAuth()

	// Load translations from database for the saved language
	// This will silently fall back to local translations if the API is unavailable
	const savedLanguage = localStorage.getItem('language') || 'en'
	try {
		await loadDbTranslations(savedLanguage)
	} catch (error) {
		// Silently ignore errors - local translations are used as fallback
		console.debug('Using local translations as fallback')
	}

	app.use(router)
	await router.isReady()
	app.mount('#app')
}

bootstrap().catch(error => {
	console.error('Failed to bootstrap application:', error)
})