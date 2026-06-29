import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

const GITHUB_PAGES_API_BASE_URL = 'https://mxllagency.pythonanywhere.com'

function getApiBaseUrlForMode(mode) {
  if (mode === 'github-pages' || mode === 'remote') {
    return GITHUB_PAGES_API_BASE_URL
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL
    ?? getApiBaseUrlForMode(mode)
  const routingMode = process.env.VITE_ROUTING_MODE ?? (mode === 'github-pages' ? 'hash' : undefined)
  const envDefines = {
    ...(apiBaseUrl ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl) } : {}),
    ...(routingMode ? { 'import.meta.env.VITE_ROUTING_MODE': JSON.stringify(routingMode) } : {}),
  }

  return {
    base: '/',
    define: Object.keys(envDefines).length ? envDefines : undefined,
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      exclude: ['dist/**', 'node_modules/**'],
    },
    server: {
      historyApiFallback: true,
    },
  }
})
