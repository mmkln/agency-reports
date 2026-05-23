import { AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { ACCESS_AUDIENCES } from './accessAudience'
import {
  canManageAgencyWorkspace,
} from './agencyAccessPolicy'
import {
  canAccessWorkspace,
} from './workspaceAccessPolicy'

const AGENCY_ADMIN_ROLES = Object.freeze(new Set([
  AGENCY_ROLES.OWNER,
  AGENCY_ROLES.ADMIN,
  AGENCY_ROLES.MANAGER,
]))

const AGENCY_MEMBER_ROLES = Object.freeze(new Set(Object.values(AGENCY_ROLES)))

const AGENCY_ACCESS_AUDIENCES = Object.freeze(new Set([
  ACCESS_AUDIENCES.AGENCY_ADMIN,
  ACCESS_AUDIENCES.AGENCY_MEMBER,
]))

const WORKSPACE_ACCESS_AUDIENCES = Object.freeze(new Set([
  ACCESS_AUDIENCES.WORKSPACE_ADMIN,
  ACCESS_AUDIENCES.WORKSPACE_MEMBER,
  ACCESS_AUDIENCES.WORKSPACE_USER,
]))

const WORKSPACE_ADMIN_ROLES = Object.freeze(new Set([
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.CLINIC_OWNER,
  WORKSPACE_ROLES.PRACTICE_MANAGER,
]))

export function hasMatureRouteAccessContext(viewer) {
  return Boolean(
    viewer?.agencyMemberships
    || viewer?.workspaceMemberships
    || viewer?.managedWorkspaceRelationships
  )
}

export function hasAgencyAdminMembership(viewer) {
  return (viewer?.agencyMemberships ?? [])
    .some((membership) => AGENCY_ADMIN_ROLES.has(membership.role))
}

export function hasAgencyMembership(viewer) {
  return (viewer?.agencyMemberships ?? [])
    .some((membership) => AGENCY_MEMBER_ROLES.has(membership.role))
}

export function hasWorkspaceMembership(viewer) {
  return Boolean((viewer?.workspaceMemberships ?? []).length)
}

export function hasWorkspaceAdminMembership(viewer) {
  return (viewer?.workspaceMemberships ?? [])
    .some((membership) => WORKSPACE_ADMIN_ROLES.has(membership.role))
}

function hasEveryCapability(viewer, requiredCapabilities) {
  const viewerCapabilities = new Set(viewer?.capabilities ?? [])

  return requiredCapabilities.every((capability) => viewerCapabilities.has(capability))
}

function canSatisfyAccessAudience(viewer, audience) {
  if (audience === ACCESS_AUDIENCES.AGENCY_ADMIN) {
    return hasAgencyAdminMembership(viewer)
  }

  if (audience === ACCESS_AUDIENCES.AGENCY_MEMBER) {
    return hasAgencyMembership(viewer)
  }

  if (audience === ACCESS_AUDIENCES.WORKSPACE_ADMIN) {
    return hasWorkspaceAdminMembership(viewer)
  }

  if (audience === ACCESS_AUDIENCES.WORKSPACE_MEMBER || audience === ACCESS_AUDIENCES.WORKSPACE_USER) {
    return hasWorkspaceMembership(viewer)
  }

  return false
}

export function canAccessRouteByContext(viewer, route) {
  if (!route?.accessAudiences?.length && !route?.requiredCapabilities?.length) {
    return true
  }

  if (!hasMatureRouteAccessContext(viewer)) {
    return false
  }

  const audienceMatches = !route.accessAudiences?.length
    || route.accessAudiences.some((audience) => canSatisfyAccessAudience(viewer, audience))
  const capabilityMatches = !route.requiredCapabilities?.length
    || hasEveryCapability(viewer, route.requiredCapabilities)

  return audienceMatches && capabilityMatches
}

function routeAllowsAgencyAudience(route) {
  return route?.accessAudiences?.some((audience) => AGENCY_ACCESS_AUDIENCES.has(audience))
}

function routeAllowsWorkspaceAudience(route) {
  return route?.accessAudiences?.some((audience) => WORKSPACE_ACCESS_AUDIENCES.has(audience))
}

export function canAccessWorkspaceRouteByContext({ route, viewer, workspaceId }) {
  if (!workspaceId) {
    return false
  }

  if (!hasMatureRouteAccessContext(viewer)) {
    return false
  }

  const canUseAgencyAccess = routeAllowsAgencyAudience(route) && canManageAgencyWorkspace(viewer, workspaceId)
  const canUseWorkspaceAccess = routeAllowsWorkspaceAudience(route) && canAccessWorkspace(viewer, workspaceId)

  return canUseAgencyAccess || canUseWorkspaceAccess
}

export function getDefaultNavigationScopeByContext(viewer, navigationScopes) {
  if (!hasMatureRouteAccessContext(viewer)) {
    return null
  }

  if (hasAgencyAdminMembership(viewer)) {
    return navigationScopes.AGENCY
  }

  if (hasAgencyMembership(viewer)) {
    return navigationScopes.TEAM_OPS
  }

  if (hasWorkspaceMembership(viewer)) {
    return navigationScopes.CLIENT_PORTAL
  }

  return null
}

export function isRouteAvailableForNavigationAudience(route, viewer) {
  if (!route?.navigationAudiences?.length) {
    return true
  }

  if (!hasMatureRouteAccessContext(viewer)) {
    return false
  }

  return route.navigationAudiences.some((audience) => canSatisfyAccessAudience(viewer, audience))
}

export function canUseAgencyWorkspaceSwitcher(viewer) {
  return hasAgencyAdminMembership(viewer)
    && Boolean((viewer?.managedWorkspaceRelationships ?? []).length)
}
