import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';
export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['**/*.spec.ts', '**/*.test.ts'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            'tests/login.spec.ts'
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
