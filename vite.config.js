import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

const GITHUB_PAGES_API_BASE_URL = 'https://mxllagency.pythonanywhere.com'
const CAMPAIGN_LEVEL_PAGES_MODE = 'campaign-level-pages'

function createSiteHtmlPlugin({ appName, appTitle, manifestPath }) {
  return {
    name: 'site-html-metadata',
    transformIndexHtml(html) {
      return html
        .replaceAll('__APP_NAME__', appName)
        .replaceAll('__APP_TITLE__', appTitle)
        .replaceAll('__MANIFEST_PATH__', manifestPath)
    },
  }
}

function getApiBaseUrlForMode(mode) {
  if (mode === 'github-pages' || mode === 'remote' || mode === CAMPAIGN_LEVEL_PAGES_MODE) {
    return GITHUB_PAGES_API_BASE_URL
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isCampaignLevelPages = mode === CAMPAIGN_LEVEL_PAGES_MODE
  const apiBaseUrl = process.env.VITE_API_BASE_URL
    ?? getApiBaseUrlForMode(mode)
  const routingMode = process.env.VITE_ROUTING_MODE
    ?? (mode === 'github-pages' || isCampaignLevelPages ? 'hash' : undefined)
  const siteVariant = process.env.VITE_SITE_VARIANT
    ?? (isCampaignLevelPages ? 'campaign-level' : 'alpine')
  const base = process.env.VITE_PUBLIC_BASE_PATH
    ?? (isCampaignLevelPages ? '/Campaign-Level/' : '/')
  const siteHtml = isCampaignLevelPages
    ? {
        appName: 'Campaign Level',
        appTitle: 'Campaign Level | Client-ready campaign reporting',
        manifestPath: 'campaign-level.webmanifest',
      }
    : {
        appName: 'Alpine Marketing',
        appTitle: 'Client Dashboard | Alpine Marketing',
        manifestPath: 'site.webmanifest',
      }
  const envDefines = {
    ...(apiBaseUrl ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl) } : {}),
    ...(routingMode ? { 'import.meta.env.VITE_ROUTING_MODE': JSON.stringify(routingMode) } : {}),
    'import.meta.env.VITE_SITE_VARIANT': JSON.stringify(siteVariant),
  }

  return {
    base,
    define: Object.keys(envDefines).length ? envDefines : undefined,
    plugins: [createSiteHtmlPlugin(siteHtml), tailwindcss(), react()],
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
