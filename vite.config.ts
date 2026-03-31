import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '')
  const baseApiUrl = env.VITE_API_BASE_URL?.trim() || ''

  let resolvedProxyTarget = 'http://127.0.0.1:5001'
  if (env.VITE_API_PROXY_TARGET) {
    resolvedProxyTarget = env.VITE_API_PROXY_TARGET
  } else if (baseApiUrl) {
    try {
      // Absolute URL configured, use its origin for local dev proxy.
      resolvedProxyTarget = new URL(baseApiUrl).origin
    } catch {
      // Relative API path (e.g. /api/v1) is valid for production builds;
      // keep default local backend target for Vite dev proxy.
      resolvedProxyTarget = 'http://127.0.0.1:5001'
    }
  }

  const apiProxyTarget = resolvedProxyTarget
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/admin/admin': {
          target: apiProxyTarget,
          changeOrigin: true
        },
        '/api/v1': {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    }
  }
})