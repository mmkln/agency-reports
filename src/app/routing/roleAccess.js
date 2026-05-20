import { CLIENT_TYPES } from '../../entities/client'
import {
  hasEveryCapability,
  USER_ROLES,
} from '../../entities/profile'

export function canAccessRoute(viewer, route) {
  if (!route?.allowedRoles?.length && !route?.requiredCapabilities?.length) {
    return true
  }

  const roleMatches = !route.allowedRoles?.length || route.allowedRoles.includes(viewer?.role)
  const capabilityMatches = !route.requiredCapabilities?.length || hasEveryCapability(viewer, route.requiredCapabilities)

  return roleMatches && capabilityMatches
}

export function filterRoutesForViewer(routes, viewer) {
  return routes.filter((route) => canAccessRoute(viewer, route))
}

function getRouteClientType({ clientId, repositories }) {
  const client = clientId ? repositories?.clients?.findById(clientId) : null

  return client?.type || CLIENT_TYPES.GENERIC
}

function isRouteAvailableForClientType(route, clientType) {
  if (route.clientTypes?.length) {
    return route.clientTypes.includes(clientType)
  }

  if (route.excludeClientTypes?.length) {
    return !route.excludeClientTypes.includes(clientType)
  }

  return true
}

function isRouteAvailableForNavigationRole(route, viewer) {
  return !route.navAllowedRoles?.length || route.navAllowedRoles.includes(viewer?.role)
}

function sortRoutesForNavigation(routes) {
  return routes
    .map((route, index) => ({
      index,
      order: route.navGroup?.order ?? route.navOrder ?? index,
      route,
    }))
    .sort((left, right) => left.order - right.order || left.index - right.index)
    .map((item) => item.route)
}

export function filterRoutesForNavigation({
  defaultClientId = null,
  repositories,
  routeParams = {},
  routes,
  viewer,
}) {
  const roleRoutes = filterRoutesForViewer(routes, viewer)
    .filter((route) => isRouteAvailableForNavigationRole(route, viewer))

  if (![USER_ROLES.CLIENT_ADMIN, USER_ROLES.CLIENT_TEAM].includes(viewer?.role)) {
    return sortRoutesForNavigation(roleRoutes)
  }

  const clientId = routeParams.clientId ?? defaultClientId ?? viewer.clientId ?? viewer.clientIds?.[0] ?? null
  const clientType = getRouteClientType({ clientId, repositories })
  const clientTypeRoutes = roleRoutes.filter((route) => isRouteAvailableForClientType(route, clientType))

  if (viewer?.role === USER_ROLES.CLIENT_TEAM && viewer.capabilities?.length) {
    return sortRoutesForNavigation(clientTypeRoutes.filter((route) => route.requiredCapabilities?.length))
  }

  return sortRoutesForNavigation(clientTypeRoutes)
}
