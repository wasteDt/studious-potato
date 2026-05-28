import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxy = {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: apiProxy
    },
    preview: {
      port: 4173,
      proxy: apiProxy
    }
  }
})
