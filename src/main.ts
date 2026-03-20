import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

async function bootstrap() {
	const authStore = useAuthStore(pinia)
	await authStore.initializeAuth()

	app.use(router)
	await router.isReady()
	app.mount('#app')
}

bootstrap()