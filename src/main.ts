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

	app.use(router)
	await router.isReady()
	app.mount('#app')
}

bootstrap()