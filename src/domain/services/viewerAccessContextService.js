import {
  getAgencyMembershipCapabilities,
  isActiveAgencyMembership,
} from '../../entities/agency-membership'
import {
  isActiveAgencyWorkspaceRelationship,
} from '../../entities/agency-workspace-relationship'
import {
  isActiveProfile,
} from '../../entities/profile'
import {
  getWorkspaceMembershipCapabilities,
  isActiveWorkspaceMembership,
  WORKSPACE_ROLES,
} from '../../entities/workspace-membership'

function listRepositoryRecords(repository) {
  return repository?.list ? repository.list() : []
}

function getWorkspaceById(repositories, workspaceId) {
  return repositories.workspaces.findById(workspaceId)
}

function mapWorkspaceMembershipRole({ membership, repositories }) {
  if (membership.workspace_role) {
    return membership.workspace_role
  }

  if (membership.role === WORKSPACE_ROLES.OWNER) {
    const workspace = getWorkspaceById(repositories, membership.workspace_id)

    return workspace?.type === 'clinic'
      ? WORKSPACE_ROLES.CLINIC_OWNER
      : WORKSPACE_ROLES.OWNER
  }

  return WORKSPACE_ROLES.VIEWER
}

function normalizeAgencyMembership(membership) {
  const capabilities = getAgencyMembershipCapabilities(membership)

  return {
    agencyId: membership.agency_id,
    capabilities,
    id: membership.id,
    role: membership.role,
    status: membership.status,
    userId: membership.user_id,
  }
}

function normalizeWorkspaceMembership({ membership, repositories }) {
  const normalizedMembership = {
    ...membership,
    capabilities: Array.isArray(membership.capabilities) ? membership.capabilities : [],
    role: mapWorkspaceMembershipRole({ membership, repositories }),
  }
  const capabilities = getWorkspaceMembershipCapabilities(normalizedMembership)

  return {
    capabilities,
    id: membership.id,
    role: normalizedMembership.role,
    status: membership.status,
    userId: membership.user_id,
    workspaceId: membership.workspace_id,
  }
}

function normalizeManagedWorkspaceRelationship(relationship) {
  return {
    agencyId: relationship.agency_id,
    id: relationship.id,
    status: relationship.status,
    workspaceId: relationship.workspace_id,
  }
}

function listActiveAgencyMemberships({ profile, repositories }) {
  return listRepositoryRecords(repositories.agencyMemberships)
    .filter(isActiveAgencyMembership)
    .filter((membership) => membership.user_id === profile.user_id)
    .map(normalizeAgencyMembership)
}

function listActiveWorkspaceMemberships({ profile, repositories }) {
  return repositories.workspaceMemberships
    .list()
    .filter(isActiveWorkspaceMembership)
    .filter((membership) => membership.user_id === profile.user_id)
    .map((membership) => normalizeWorkspaceMembership({
      membership,
      repositories,
    }))
}

function listManagedWorkspaceRelationships({ agencyMemberships, repositories }) {
  const activeAgencyIds = new Set(agencyMemberships.map((membership) => membership.agencyId))

  return listRepositoryRecords(repositories.agencyWorkspaceRelationships)
    .filter(isActiveAgencyWorkspaceRelationship)
    .filter((relationship) => activeAgencyIds.has(relationship.agency_id))
    .map(normalizeManagedWorkspaceRelationship)
}

function getUnionCapabilities({ agencyMemberships, workspaceMemberships }) {
  return [...new Set([
    ...agencyMemberships.flatMap((membership) => membership.capabilities),
    ...workspaceMemberships.flatMap((membership) => membership.capabilities),
  ])]
}

export function buildViewerAccessContext({ profile, repositories }) {
  if (!profile || !isActiveProfile(profile)) {
    return null
  }

  const agencyMemberships = listActiveAgencyMemberships({ profile, repositories })
  const workspaceMemberships = listActiveWorkspaceMemberships({ profile, repositories })
  const managedWorkspaceRelationships = listManagedWorkspaceRelationships({
    agencyMemberships,
    repositories,
  })
  const activeAgencyId = agencyMemberships[0]?.agencyId ?? null
  const activeWorkspaceId = workspaceMemberships[0]?.workspaceId ?? null
  const capabilities = getUnionCapabilities({
    agencyMemberships,
    workspaceMemberships,
  })

  return {
    activeAgencyId,
    activeWorkspaceId,
    agencyMemberships,
    capabilities,
    email: profile.email,
    managedWorkspaceRelationships,
    name: profile.name,
    profileId: profile.id,
    user: {
      email: profile.email,
      id: profile.user_id,
      name: profile.name,
      profileId: profile.id,
      status: profile.status,
    },
    userId: profile.user_id,
    workspaceMemberships,
  }
}

export function listAccessibleWorkspaceIds(viewer) {
  return [
    ...new Set((viewer?.workspaceMemberships ?? []).map((membership) => membership.workspaceId)),
  ]
}

export function listManagedWorkspaceIds(viewer) {
  return [
    ...new Set((viewer?.managedWorkspaceRelationships ?? []).map((relationship) => relationship.workspaceId)),
  ]
}

export function hasAgencyCapability(viewer, capability, agencyId = viewer?.activeAgencyId) {
  if (!capability || !agencyId) {
    return Boolean(capability ? false : agencyId)
  }

  return (viewer?.agencyMemberships ?? []).some((membership) => (
    membership.agencyId === agencyId
    && membership.capabilities.includes(capability)
  ))
}

export function hasWorkspaceCapability(viewer, capability, workspaceId = viewer?.activeWorkspaceId) {
  if (!capability || !workspaceId) {
    return Boolean(capability ? false : workspaceId)
  }

  return (viewer?.workspaceMemberships ?? []).some((membership) => (
    membership.workspaceId === workspaceId
    && membership.capabilities.includes(capability)
  ))
}

export function canViewWorkspacePortal(viewer, workspaceId = viewer?.activeWorkspaceId) {
  return listAccessibleWorkspaceIds(viewer).includes(workspaceId)
}

export function canManageWorkspace(viewer, workspaceId) {
  return listManagedWorkspaceIds(viewer).includes(workspaceId)
}
