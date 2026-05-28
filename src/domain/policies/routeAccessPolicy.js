import { AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'

const ACTIVE_STATUS = 'active'

const AGENCY_ADMIN_ROLES = Object.freeze(new Set([
  AGENCY_ROLES.OWNER,
  AGENCY_ROLES.ADMIN,
  AGENCY_ROLES.MANAGER,
]))

const AGENCY_MEMBER_ROLES = Object.freeze(new Set(Object.values(AGENCY_ROLES)))

const WORKSPACE_ADMIN_ROLES = Object.freeze(new Set([
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.CLINIC_OWNER,
  WORKSPACE_ROLES.PRACTICE_MANAGER,
]))

function isActive(record) {
  return !record?.status || record.status === ACTIVE_STATUS
}

export function hasMatureRouteAccessContext(viewer) {
  return Boolean(
    viewer?.agencyMemberships
    || viewer?.workspaceMemberships
    || viewer?.managedWorkspaceRelationships
  )
}

export function hasAgencyAdminMembership(viewer) {
  return (viewer?.agencyMemberships ?? [])
    .filter(isActive)
    .some((membership) => AGENCY_ADMIN_ROLES.has(membership.role))
}

export function hasAgencyMembership(viewer) {
  return (viewer?.agencyMemberships ?? [])
    .filter(isActive)
    .some((membership) => AGENCY_MEMBER_ROLES.has(membership.role))
}

export function hasWorkspaceMembership(viewer) {
  return (viewer?.workspaceMemberships ?? []).some(isActive)
}

export function hasWorkspaceAdminMembership(viewer) {
  return (viewer?.workspaceMemberships ?? [])
    .filter(isActive)
    .some((membership) => WORKSPACE_ADMIN_ROLES.has(membership.role))
}

export function canUseAgencyWorkspaceSwitcher(viewer) {
  return hasAgencyAdminMembership(viewer)
    && (viewer?.managedWorkspaceRelationships ?? []).some(isActive)
}
