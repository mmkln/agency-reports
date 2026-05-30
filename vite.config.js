import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const routingMode = process.env.VITE_ROUTING_MODE ?? (mode === 'github-pages' ? 'hash' : undefined)

  return {
    base: command === 'build' ? '/agency-reports/' : '/',
    define: routingMode
      ? {
          'import.meta.env.VITE_ROUTING_MODE': JSON.stringify(routingMode),
        }
      : undefined,
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
