import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAuthStore } from '@/stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

async function bootstrap() {
	const authStore = useAuthStore(pinia)
	await authStore.initializeAuth()

	// Note: Translation loading from database is skipped here since the user may not be authenticated yet
	// Translations will be loaded after successful login via setLanguage() or by the auth store
	// Local translations are used as fallback

	app.use(router)
	await router.isReady()
	app.mount('#app')
}

bootstrap().catch(error => {
	console.error('Failed to bootstrap application:', error)
})