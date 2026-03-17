import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    const env = loadEnv(mode, process.cwd(), '');
    
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
                    target: env.VITE_API_BASE_URL || 'http://localhost:5001',
                    changeOrigin: true
                }
            }
        }
    };
});
