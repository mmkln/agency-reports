import { CLIENT_TYPES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'

export function canAccessRoute(viewer, route) {
  if (!route?.allowedRoles?.length) {
    return true
  }

  return route.allowedRoles.includes(viewer?.role)
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

export function filterRoutesForNavigation({
  defaultClientId = null,
  repositories,
  routeParams = {},
  routes,
  viewer,
}) {
  const roleRoutes = filterRoutesForViewer(routes, viewer)

  if (viewer?.role !== USER_ROLES.CLIENT_USER) {
    return roleRoutes
  }

  const clientId = routeParams.clientId ?? defaultClientId ?? viewer.clientId ?? viewer.clientIds?.[0] ?? null
  const clientType = getRouteClientType({ clientId, repositories })

  return roleRoutes.filter((route) => isRouteAvailableForClientType(route, clientType))
}
