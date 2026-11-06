import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

const GITHUB_PAGES_API_BASE_URL = 'https://mxllagency.pythonanywhere.com'
const CAMPAIGN_LEVEL_PAGES_MODE = 'campaign-level-pages'

function createSiteHtmlPlugin({
  appName,
  appTitle,
  appleTouchIconPath,
  favicon96Path,
  faviconIcoPath,
  faviconSvgPath,
  manifestPath,
}) {
  return {
    name: 'site-html-metadata',
    transformIndexHtml(html) {
      return html
        .replaceAll('__APP_NAME__', appName)
        .replaceAll('__APP_TITLE__', appTitle)
        .replaceAll('__APPLE_TOUCH_ICON_PATH__', appleTouchIconPath)
        .replaceAll('__FAVICON_96_PATH__', favicon96Path)
        .replaceAll('__FAVICON_ICO_PATH__', faviconIcoPath)
        .replaceAll('__FAVICON_SVG_PATH__', faviconSvgPath)
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
        appleTouchIconPath: 'campaign-level/apple-touch-icon.png',
        favicon96Path: 'campaign-level/favicon-96x96.png',
        faviconIcoPath: 'campaign-level/favicon.ico',
        faviconSvgPath: 'campaign-level/favicon.svg',
        manifestPath: 'campaign-level.webmanifest',
      }
    : {
        appName: 'Alpine Marketing',
        appTitle: 'Client Dashboard | Alpine Marketing',
        appleTouchIconPath: '/apple-touch-icon.png',
        favicon96Path: '/favicon-96x96.png',
        faviconIcoPath: '/favicon.ico',
        faviconSvgPath: '/favicon.svg',
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
