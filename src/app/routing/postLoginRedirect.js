import { getHomeHrefForViewer } from '../../domain/services/viewerHomeService'
import { canAccessRouteWithContext } from './roleAccess'
import { findRouteAccessMetadataByPath } from './routeAccessMetadata'

function getSafeInternalHref(href) {
  if (!href?.startsWith('/') || href.startsWith('//')) {
    return null
  }

  try {
    const parsedUrl = new URL(href, window.location.origin)

    if (parsedUrl.origin !== window.location.origin) {
      return null
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
  } catch {
    return null
  }
}

function getRouteParamsFromHref(href) {
  const parsedUrl = new URL(href, window.location.origin)

  return Object.fromEntries(parsedUrl.searchParams.entries())
}

export function getPostLoginHref({ nextHref, viewer }) {
  const fallbackHref = getHomeHrefForViewer(viewer)
  const safeNextHref = getSafeInternalHref(nextHref)

  if (!safeNextHref) {
    return fallbackHref
  }

  const parsedUrl = new URL(safeNextHref, window.location.origin)
  const route = findRouteAccessMetadataByPath(parsedUrl.pathname)

  if (!route || route.id === 'login') {
    return fallbackHref
  }

  if (!canAccessRouteWithContext(viewer, route, {
    defaultClientId: viewer?.activeWorkspaceId,
    routeParams: getRouteParamsFromHref(safeNextHref),
  })) {
    return fallbackHref
  }

  return safeNextHref
}
