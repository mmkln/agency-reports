import { useEffect } from 'react'

import { getAppBaseHref } from '../../../shared/routing'

function getPublicAssetHref(path) {
  return `${getAppBaseHref()}${String(path).replace(/^\/+/, '')}`
}

export function SiteDocumentMetadata({ site }) {
  useEffect(() => {
    document.title = site.documentTitle

    document
      .querySelector('meta[name="apple-mobile-web-app-title"]')
      ?.setAttribute('content', site.brand.name)

    document
      .querySelector('link[rel="manifest"]')
      ?.setAttribute('href', getPublicAssetHref(site.manifestPath))

    if (site.brand.faviconUrl) {
      document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')
        .forEach((link) => link.setAttribute('href', site.brand.faviconUrl))
    }
  }, [site])

  return null
}
