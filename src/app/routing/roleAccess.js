import { CLIENT_TYPES } from '../../entities/client'
import { AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'

export const NAVIGATION_SCOPES = Object.freeze({
  AGENCY: 'agency',
  CLIENT_PORTAL: 'clientPortal',
  TEAM_OPS: 'teamOps',
})

export const ROUTE_ACCESS_SCOPES = Object.freeze({
  ACCOUNT: 'account',
  AGENCY: 'agency',
  PUBLIC: 'public',
  WORKSPACE: 'workspace',
})

const ACTIVE_STATUS = 'active'

const AGENCY_ADMIN_ROLES = Object.freeze(new Set([
  AGENCY_ROLES.OWNER,
  AGENCY_ROLES.ADMIN,
  AGENCY_ROLES.MANAGER,
]))

const WORKSPACE_ADMIN_ROLES = Object.freeze(new Set([
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.CLINIC_OWNER,
  WORKSPACE_ROLES.PRACTICE_MANAGER,
]))

const CLIENT_TEAM_BASE_NAV_ROUTE_IDS = Object.freeze(new Set([
  'dental-growth-review',
  'client-settings',
  'account-settings',
]))

const CLIENT_TEAM_CAPABILITY_UTILITY_ROUTE_IDS = Object.freeze(new Set([
  'client-settings',
  'account-settings',
]))

function isActive(record) {
  return !record?.status || record.status === ACTIVE_STATUS
}

function hasCapability(record, capability) {
  if (!capability) {
    return true
  }

  return (record?.capabilities ?? []).includes(capability)
}

function getRouteAccess(route) {
  return route?.access ?? (route?.layout === 'auth' || route?.layout === 'public'
    ? { scope: ROUTE_ACCESS_SCOPES.PUBLIC }
    : null)
}

function getRouteWorkspaceTypes(route) {
  return getRouteAccess(route)?.workspaceTypes ?? route?.workspaceTypes ?? route?.clientTypes ?? []
}

function hasWorkspaceType(route, workspaceType) {
  const workspaceTypes = getRouteWorkspaceTypes(route)

  if (!workspaceTypes.length) {
    return true
  }

  return workspaceTypes.includes(workspaceType ?? CLIENT_TYPES.GENERIC)
}

function getActiveAgencyMemberships(viewer) {
  return (viewer?.agencyMemberships ?? []).filter(isActive)
}

function getActiveWorkspaceMemberships(viewer) {
  return (viewer?.workspaceMemberships ?? []).filter(isActive)
}

function getActiveManagedWorkspaceRelationships(viewer) {
  return (viewer?.managedWorkspaceRelationships ?? []).filter(isActive)
}

function getAgencyMembershipForCapability(viewer, {
  agencyId = null,
  capability = null,
} = {}) {
  return getActiveAgencyMemberships(viewer).find((membership) => (
    (!agencyId || membership.agencyId === agencyId)
    && hasCapability(membership, capability)
  )) ?? null
}

function getWorkspaceMembershipForCapability(viewer, {
  capability = null,
  route = null,
  workspaceId = null,
} = {}) {
  return getActiveWorkspaceMemberships(viewer).find((membership) => (
    (!workspaceId || membership.workspaceId === workspaceId)
    && hasCapability(membership, capability)
    && hasWorkspaceType(route, membership.workspaceType)
  )) ?? null
}

function getManagedWorkspaceRelationshipForCapability(viewer, {
  capability = null,
  route = null,
  workspaceId = null,
} = {}) {
  return getActiveManagedWorkspaceRelationships(viewer).find((relationship) => {
    if (workspaceId && relationship.workspaceId !== workspaceId) {
      return false
    }

    if (!hasWorkspaceType(route, relationship.workspaceType)) {
      return false
    }

    return Boolean(getAgencyMembershipForCapability(viewer, {
      agencyId: relationship.agencyId,
      capability,
    }))
  }) ?? null
}

export function hasAgencyAdminMembership(viewer) {
  return getActiveAgencyMemberships(viewer)
    .some((membership) => AGENCY_ADMIN_ROLES.has(membership.role))
}

export function hasAgencyMembership(viewer) {
  return Boolean(getActiveAgencyMemberships(viewer).length)
}

export function hasWorkspaceMembership(viewer) {
  return Boolean(getActiveWorkspaceMemberships(viewer).length)
}

export function hasWorkspaceAdminMembership(viewer) {
  return getActiveWorkspaceMemberships(viewer)
    .some((membership) => WORKSPACE_ADMIN_ROLES.has(membership.role))
}

export function getRouteClientId({ defaultClientId = null, routeParams = {}, viewer }) {
  return routeParams.workspaceId ?? routeParams.clientId ?? defaultClientId ?? viewer?.activeWorkspaceId ?? null
}

export function isClientScopedRoute(route) {
  const access = getRouteAccess(route)

  return Boolean(
    access?.scope === ROUTE_ACCESS_SCOPES.WORKSPACE
    || route?.path?.startsWith('/portal/')
    || route?.path?.startsWith('/agency/client-')
    || route?.id === 'dental-growth-review'
  )
}

export function canAccessRouteWithContext(viewer, route, {
  defaultClientId = null,
  routeParams = {},
} = {}) {
  const access = getRouteAccess(route)

  if (!access || access.scope === ROUTE_ACCESS_SCOPES.PUBLIC) {
    return true
  }

  if (!viewer?.userId) {
    return false
  }

  if (access.scope === ROUTE_ACCESS_SCOPES.ACCOUNT) {
    return true
  }

  if (access.scope === ROUTE_ACCESS_SCOPES.AGENCY) {
    return Boolean(getAgencyMembershipForCapability(viewer, {
      agencyId: viewer.activeAgencyId,
      capability: access.capability,
    }))
  }

  if (access.scope !== ROUTE_ACCESS_SCOPES.WORKSPACE) {
    return false
  }

  const workspaceId = getRouteClientId({ defaultClientId, routeParams, viewer })

  if (!workspaceId) {
    return false
  }

  if (access.workspaceCapability && getWorkspaceMembershipForCapability(viewer, {
    capability: access.workspaceCapability,
    route,
    workspaceId,
  })) {
    return true
  }

  return Boolean(access.agencyCapability && getManagedWorkspaceRelationshipForCapability(viewer, {
    capability: access.agencyCapability,
    route,
    workspaceId,
  }))
}

function summarizeAccessRecord(record) {
  if (!record) {
    return null
  }

  return {
    agencyId: record.agencyId,
    capabilities: record.capabilities ?? [],
    id: record.id,
    role: record.role,
    status: record.status,
    workspaceId: record.workspaceId,
    workspaceName: record.workspaceName,
    workspaceType: record.workspaceType,
  }
}

export function getRouteAccessDiagnostic(viewer, route, {
  defaultClientId = null,
  routeParams = {},
} = {}) {
  const access = getRouteAccess(route)
  const workspaceId = access?.scope === ROUTE_ACCESS_SCOPES.WORKSPACE
    ? getRouteClientId({ defaultClientId, routeParams, viewer })
    : null
  const requiredWorkspaceTypes = getRouteWorkspaceTypes(route)
  const matchingWorkspaceMemberships = getActiveWorkspaceMemberships(viewer)
    .filter((membership) => !workspaceId || membership.workspaceId === workspaceId)
  const matchingManagedRelationships = getActiveManagedWorkspaceRelationships(viewer)
    .filter((relationship) => !workspaceId || relationship.workspaceId === workspaceId)
  const matchingAgencyMemberships = getActiveAgencyMemberships(viewer)
    .filter((membership) => !viewer?.activeAgencyId || membership.agencyId === viewer.activeAgencyId)
  const canAccess = canAccessRouteWithContext(viewer, route, {
    defaultClientId,
    routeParams,
  })

  return {
    access,
    activeAgencyId: viewer?.activeAgencyId ?? null,
    activeWorkspaceId: viewer?.activeWorkspaceId ?? null,
    canAccess,
    defaultClientId,
    matchingAgencyMemberships: matchingAgencyMemberships.map(summarizeAccessRecord),
    matchingManagedRelationships: matchingManagedRelationships.map(summarizeAccessRecord),
    matchingWorkspaceMemberships: matchingWorkspaceMemberships.map(summarizeAccessRecord),
    requiredWorkspaceTypes,
    route: route ? {
      id: route.id,
      path: route.path,
    } : null,
    routeParams,
    userId: viewer?.userId ?? null,
    workspaceId,
  }
}

export function canAccessRoute(viewer, route) {
  return canAccessRouteWithContext(viewer, route)
}

export function filterRoutesForViewer(routes, viewer) {
  return routes.filter((route) => canAccessRoute(viewer, route))
}

export function getDefaultNavigationScopeForViewer(viewer) {
  if (hasAgencyAdminMembership(viewer)) {
    return NAVIGATION_SCOPES.AGENCY
  }

  if (hasAgencyMembership(viewer)) {
    return NAVIGATION_SCOPES.TEAM_OPS
  }

  if (hasWorkspaceMembership(viewer)) {
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
  if (route.isLegacyRedirect) {
    return false
  }

  if (route.showInNav === false) {
    return true
  }

  if (!navigationScope) {
    return true
  }

  return getRouteNavigationScopes(route).includes(navigationScope)
}

function isRouteAvailableForClientTeamNavigation(route, viewer) {
  const workspaceMembership = getActiveWorkspaceMemberships(viewer)
    .find((membership) => membership.workspaceId === viewer?.activeWorkspaceId)

  if (!workspaceMembership || hasWorkspaceAdminMembership(viewer)) {
    return true
  }

  if ((workspaceMembership.capabilities ?? []).length) {
    return Boolean(getRouteAccess(route)?.workspaceCapability)
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
  defaultClientId = null,
  navigationScope = null,
  routeParams = {},
  routes,
  viewer,
}) {
  const resolvedNavigationScope = navigationScope ?? getDefaultNavigationScopeForViewer(viewer)
  const roleRoutes = routes
    .filter((route) => canAccessRouteWithContext(viewer, route, { defaultClientId, routeParams }))
    .filter((route) => isRouteAvailableForNavigationScope(route, resolvedNavigationScope))

  if (resolvedNavigationScope !== NAVIGATION_SCOPES.CLIENT_PORTAL) {
    return sortRoutesForNavigation(roleRoutes)
  }

  return sortRoutesForNavigation(roleRoutes.filter((route) => (
    isRouteAvailableForClientTeamNavigation(route, viewer)
  )))
}
