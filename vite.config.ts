import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '')
  const baseApiUrl = env.VITE_API_BASE_URL
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || (baseApiUrl ? new URL(baseApiUrl).origin : 'http://127.0.0.1:5001')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        '/api/v1': {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    }
  }
})