import { CLIENT_TYPES } from '../../entities/client'
import {
  hasEveryCapability,
  USER_ROLES,
} from '../../entities/profile'

export const NAVIGATION_SCOPES = Object.freeze({
  AGENCY: 'agency',
  CLIENT_PORTAL: 'clientPortal',
  TEAM_OPS: 'teamOps',
})

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

function getRouteClientType({ clientId, clientType, repositories }) {
  if (clientType) {
    return clientType
  }

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

export function isClientScopedRoute(route) {
  return Boolean(
    route?.clientTypes?.length
    || route?.excludeClientTypes?.length
    || route?.path?.startsWith('/client/')
    || route?.id === 'dental-growth-review',
  )
}

export function getRouteClientId({ defaultClientId = null, routeParams = {}, viewer }) {
  return routeParams.clientId ?? defaultClientId ?? viewer?.clientId ?? viewer?.clientIds?.[0] ?? null
}

function canAccessRequestedClient({ clientId, route, viewer }) {
  if (!isClientScopedRoute(route)) {
    return true
  }

  if (![USER_ROLES.CLIENT_ADMIN, USER_ROLES.CLIENT_TEAM].includes(viewer?.role)) {
    return true
  }

  const viewerClientIds = new Set([
    viewer?.clientId,
    ...(viewer?.clientIds ?? []),
  ].filter(Boolean))

  return Boolean(clientId && viewerClientIds.has(clientId))
}

export function canAccessRouteWithContext(viewer, route, {
  clientType = null,
  defaultClientId = null,
  repositories,
  routeParams = {},
} = {}) {
  if (!canAccessRoute(viewer, route)) {
    return false
  }

  if (!isClientScopedRoute(route)) {
    return true
  }

  const clientId = getRouteClientId({ defaultClientId, routeParams, viewer })

  if (!canAccessRequestedClient({ clientId, route, viewer })) {
    return false
  }

  if (!repositories && !clientType) {
    return true
  }

  const resolvedClientType = getRouteClientType({ clientId, clientType, repositories })

  return isRouteAvailableForClientType(route, resolvedClientType)
}

function isRouteAvailableForNavigationRole(route, viewer) {
  return !route.navAllowedRoles?.length || route.navAllowedRoles.includes(viewer?.role)
}

export function getDefaultNavigationScopeForViewer(viewer) {
  if (viewer?.role === USER_ROLES.AGENCY_ADMIN) {
    return NAVIGATION_SCOPES.AGENCY
  }

  if (viewer?.role === USER_ROLES.AGENCY_TEAM) {
    return NAVIGATION_SCOPES.TEAM_OPS
  }

  if ([USER_ROLES.CLIENT_ADMIN, USER_ROLES.CLIENT_TEAM].includes(viewer?.role)) {
    return NAVIGATION_SCOPES.CLIENT_PORTAL
  }

  return null
}

function getRouteNavigationScopes(route) {
  if (Array.isArray(route.navigationScopes)) {
    return route.navigationScopes
  }

  return route.navigationScope ? [route.navigationScope] : []
}

function isRouteAvailableForNavigationScope(route, navigationScope) {
  if (route.showInNav === false) {
    return true
  }

  if (!navigationScope) {
    return true
  }

  return getRouteNavigationScopes(route).includes(navigationScope)
}

const CLIENT_TEAM_BASE_NAV_ROUTE_IDS = Object.freeze(new Set([
  'client-overview',
  'client-action-needed',
  'client-reports-dashboards',
  'client-requests',
  'client-files-links',
  'client-updates',
  'client-settings',
  'account-settings',
]))

const CLIENT_TEAM_CAPABILITY_UTILITY_ROUTE_IDS = Object.freeze(new Set([
  'client-settings',
  'account-settings',
]))

function isRouteAvailableForClientTeamNavigation(route, viewer) {
  if (viewer?.role !== USER_ROLES.CLIENT_TEAM) {
    return true
  }

  if (viewer.capabilities?.length) {
    return Boolean(route.requiredCapabilities?.length)
      || CLIENT_TEAM_CAPABILITY_UTILITY_ROUTE_IDS.has(route.id)
  }

  return CLIENT_TEAM_BASE_NAV_ROUTE_IDS.has(route.id) || route.showInNav === false
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
  clientType = null,
  defaultClientId = null,
  navigationScope = null,
  repositories,
  routeParams = {},
  routes,
  viewer,
}) {
  const resolvedNavigationScope = navigationScope ?? getDefaultNavigationScopeForViewer(viewer)
  const roleRoutes = filterRoutesForViewer(routes, viewer)
    .filter((route) => isRouteAvailableForNavigationRole(route, viewer))
    .filter((route) => isRouteAvailableForNavigationScope(route, resolvedNavigationScope))

  if (![USER_ROLES.CLIENT_ADMIN, USER_ROLES.CLIENT_TEAM].includes(viewer?.role)) {
    return sortRoutesForNavigation(roleRoutes)
  }

  const clientId = routeParams.clientId ?? defaultClientId ?? viewer.clientId ?? viewer.clientIds?.[0] ?? null
  const resolvedClientType = getRouteClientType({ clientId, clientType, repositories })
  const clientTypeRoutes = roleRoutes.filter((route) => isRouteAvailableForClientType(route, resolvedClientType))

  return sortRoutesForNavigation(clientTypeRoutes.filter((route) => (
    isRouteAvailableForClientTeamNavigation(route, viewer)
  )))
}
