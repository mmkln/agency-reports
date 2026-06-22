import { getAppBaseHref } from './basePath'
import { isHashRouting } from './routingMode'

export function getAppHref(path = '/') {
  const baseHref = getAppBaseHref()
  const normalizedPath = normalizeAppPath(path)

  if (isHashRouting()) {
    return `${baseHref}#${normalizedPath}`
  }

  return `${baseHref}${normalizedPath.replace(/^\/+/, '')}`
}

export function getAbsoluteAppHref(path = '/') {
  const appHref = getAppHref(path)

  if (typeof window === 'undefined') {
    return appHref
  }

  return `${window.location.origin}${appHref}`
}

function normalizeAppPath(path) {
  const value = String(path || '/')

  return value.startsWith('/') ? value : `/${value}`
}
