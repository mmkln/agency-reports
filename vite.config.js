import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { createDevPortalSnapshotMiddleware } from './src/app/providers/repositories/createDevPortalSnapshotMiddleware.js'

function devPortalSnapshotApiPlugin() {
  return {
    configureServer(server) {
      server.middlewares.use(createDevPortalSnapshotMiddleware())
    },
    name: 'dev-portal-snapshot-api',
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/agency-reports/' : '/',
  plugins: [devPortalSnapshotApiPlugin(), tailwindcss(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    exclude: ['dist/**', 'e2e/**', 'node_modules/**'],
  },
  server: {
    historyApiFallback: true,
  },
}))
