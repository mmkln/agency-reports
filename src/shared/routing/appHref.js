import { getAppBaseHref } from './basePath'

export function getAppHref(path = '/') {
  const normalizedBase = getAppBaseHref()
  const normalizedPath = String(path || '/').replace(/^\/+/, '')

  return `${normalizedBase}${normalizedPath}`
}
