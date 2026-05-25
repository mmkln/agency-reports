import { CLIENT_TYPES } from '../../entities/client'
import { ACCESS_AUDIENCES } from '../../domain/policies/accessAudience'
import {
  canAccessRouteByContext,
  canAccessWorkspaceRouteByContext,
  getDefaultNavigationScopeByContext,
  hasWorkspaceAdminMembership,
  isRouteAvailableForNavigationAudience,
} from '../../domain/policies/routeAccessPolicy'

const AGENCY_ROUTE_AUDIENCES = Object.freeze(new Set([
  ACCESS_AUDIENCES.AGENCY_ADMIN,
  ACCESS_AUDIENCES.AGENCY_MEMBER,
]))

const WORKSPACE_ROUTE_AUDIENCES = Object.freeze(new Set([
  ACCESS_AUDIENCES.WORKSPACE_ADMIN,
  ACCESS_AUDIENCES.WORKSPACE_MEMBER,
  ACCESS_AUDIENCES.WORKSPACE_USER,
]))

export const NAVIGATION_SCOPES = Object.freeze({
  AGENCY: 'agency',
  CLIENT_PORTAL: 'clientPortal',
  TEAM_OPS: 'teamOps',
})

export function canAccessRoute(viewer, route) {
  return canAccessRouteByContext(viewer, route)
}

export function filterRoutesForViewer(routes, viewer) {
  return routes.filter((route) => canAccessRoute(viewer, route))
}

function getRouteClientType({ clientId, clientType, repositories }) {
  if (clientType) {
    return clientType
  }

  const client = clientId ? repositories?.workspaces?.findById(clientId) : null

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
    || route?.path?.startsWith('/admin/client-')
    || route?.id === 'dental-growth-review',
  )
}

export function getRouteClientId({ defaultClientId = null, routeParams = {}, viewer }) {
  return routeParams.clientId ?? defaultClientId ?? viewer?.activeWorkspaceId ?? null
}

export function canAccessRouteWithContext(viewer, route, {
  clientType = null,
  defaultClientId = null,
  repositories,
  routeAccessContext = null,
  routeParams = {},
} = {}) {
  if (!canAccessRoute(viewer, route)) {
    return false
  }

  if (!isClientScopedRoute(route)) {
    return true
  }

  const clientId = getRouteClientId({ defaultClientId, routeParams, viewer })
  const contextAccess = canAccessWorkspaceRouteFromLoadedContext(route, routeAccessContext)

  if (contextAccess !== null && !contextAccess) {
    return false
  }

  if (contextAccess === null && !canAccessWorkspaceRouteByContext({ route, viewer, workspaceId: clientId })) {
    return false
  }

  if (!repositories && !clientType) {
    return true
  }

  const resolvedClientType = getRouteClientType({ clientId, clientType, repositories })

  return isRouteAvailableForClientType(route, resolvedClientType)
}

function isRouteAvailableForNavigationRole(route, viewer) {
  return isRouteAvailableForNavigationAudience(route, viewer)
}

export function getDefaultNavigationScopeForViewer(viewer) {
  return getDefaultNavigationScopeByContext(viewer, NAVIGATION_SCOPES)
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
  'dental-growth-review',
  'client-settings',
  'account-settings',
]))

const CLIENT_TEAM_CAPABILITY_UTILITY_ROUTE_IDS = Object.freeze(new Set([
  'client-settings',
  'account-settings',
]))

function routeHasAudience(route, audiences) {
  return route?.accessAudiences?.some((audience) => audiences.has(audience))
}

function canAccessWorkspaceRouteFromLoadedContext(route, routeAccessContext) {
  if (!routeAccessContext) {
    return null
  }

  const canUseAgencyAccess = routeHasAudience(route, AGENCY_ROUTE_AUDIENCES)
    && routeAccessContext.canManageWorkspace
  const canUseWorkspaceAccess = routeHasAudience(route, WORKSPACE_ROUTE_AUDIENCES)
    && routeAccessContext.canViewWorkspacePortal

  return canUseAgencyAccess || canUseWorkspaceAccess
}

function isRouteAvailableForClientTeamNavigation(route, viewer) {
  const workspaceMembership = (viewer?.workspaceMemberships ?? [])
    .find((membership) => membership.workspaceId === viewer?.activeWorkspaceId)

  if (!workspaceMembership || hasWorkspaceAdminMembership(viewer)) {
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

  if (resolvedNavigationScope !== NAVIGATION_SCOPES.CLIENT_PORTAL) {
    return sortRoutesForNavigation(roleRoutes)
  }

  const clientId = getRouteClientId({ defaultClientId, routeParams, viewer })
  const resolvedClientType = getRouteClientType({ clientId, clientType, repositories })
  const clientTypeRoutes = roleRoutes.filter((route) => isRouteAvailableForClientType(route, resolvedClientType))

  return sortRoutesForNavigation(clientTypeRoutes.filter((route) => (
    isRouteAvailableForClientTeamNavigation(route, viewer)
  )))
}
