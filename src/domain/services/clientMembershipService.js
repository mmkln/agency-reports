import {
  isActiveWorkspaceMembership,
  WORKSPACE_MEMBERSHIP_STATUSES,
  WORKSPACE_ROLES,
} from '../../entities/workspace-membership'
import { assertCanManageAgencyWorkspaceAccess } from '../policies/agencyAccessPolicy'
import { canAccessWorkspace } from '../policies/workspaceAccessPolicy'
import { canManageClientTeam } from '../policies/clientTeamPolicy'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_MEMBERSHIP_ROLES = new Set(Object.values(WORKSPACE_ROLES))

function getAdminClient({ clientId, repositories, viewer }) {
  assertCanManageAgencyWorkspaceAccess(viewer, clientId)

  const client = repositories.workspaces.findById(clientId)

  if (!client) {
    throw new Error('Client was not found.')
  }

  return client
}

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeEmail(value) {
  const email = requireText(value, 'Email').toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Email must be a valid email address.')
  }

  return email
}

function normalizeRole(role) {
  const normalizedRole = role || WORKSPACE_ROLES.VIEWER

  if (!VALID_MEMBERSHIP_ROLES.has(normalizedRole)) {
    throw new Error('Membership role is invalid.')
  }

  return normalizedRole
}

function mapMember({ membership, profile }) {
  return {
    clientId: membership.workspace_id,
    email: profile?.email ?? '',
    id: membership.id,
    name: profile?.name ?? 'Unknown member',
    role: membership.role,
    userId: membership.user_id,
  }
}

export function listClientMembers({ clientId, repositories, viewer }) {
  getAdminClient({ clientId, repositories, viewer })

  return repositories.workspaceMemberships
    .listByWorkspaceId(clientId)
    .filter(isActiveWorkspaceMembership)
    .map((membership) => mapMember({
      membership,
      profile: repositories.profiles.findByUserId(membership.user_id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email))
}

export function addClientMember({
  clientId,
  email,
  idGenerator,
  name,
  now = () => new Date().toISOString(),
  repositories,
  role = WORKSPACE_ROLES.VIEWER,
  viewer,
}) {
  const client = getAdminClient({ clientId, repositories, viewer })

  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const normalizedEmail = normalizeEmail(email)
  const normalizedName = requireText(name, 'Name')
  const normalizedRole = normalizeRole(role)
  const timestamp = now()
  const existingProfile = repositories.profiles
    .list()
    .find((profile) => profile.email.toLowerCase() === normalizedEmail)

  const profile = existingProfile ?? {
    agency_id: client.agency_id,
    created_at: timestamp,
    email: normalizedEmail,
    id: idGenerator(),
    name: normalizedName,
    updated_at: timestamp,
    user_id: idGenerator(),
  }

  repositories.profiles.upsert({
    ...profile,
    agency_id: client.agency_id,
    name: normalizedName,
    updated_at: timestamp,
  })

  const existingMembership = repositories.workspaceMemberships
    .listByWorkspaceId(clientId)
    .filter(isActiveWorkspaceMembership)
    .find((membership) => membership.user_id === profile.user_id)

  if (existingMembership) {
    throw new Error('This user already has access to the client.')
  }

  const membership = repositories.workspaceMemberships.upsert({
    created_at: timestamp,
    id: idGenerator(),
    role: normalizedRole,
    updated_at: timestamp,
    user_id: profile.user_id,
    workspace_id: clientId,
  })

  return mapMember({
    membership,
    profile: repositories.profiles.findByUserId(profile.user_id),
  })
}

export function updateClientMembershipRole({
  membershipId,
  now = () => new Date().toISOString(),
  repositories,
  role,
  viewer,
}) {
  const membership = repositories.workspaceMemberships.findById(membershipId)

  if (!membership) {
    throw new Error('Membership was not found.')
  }

  if (!canManageClientTeam({ clientId: membership.workspace_id, repositories, viewer })) {
    throw new Error('Only workspace owners can manage members.')
  }

  const normalizedRole = normalizeRole(role)

  if (membership.role === WORKSPACE_ROLES.OWNER && normalizedRole !== WORKSPACE_ROLES.OWNER) {
    const ownerCount = repositories.workspaceMemberships
      .listByWorkspaceId(membership.workspace_id)
      .filter(isActiveWorkspaceMembership)
      .filter((item) => item.role === WORKSPACE_ROLES.OWNER)
      .length

    if (ownerCount <= 1) {
      throw new Error('Transfer ownership to another owner before changing this role.')
    }
  }

  const updatedMembership = repositories.workspaceMemberships.upsert({
    ...membership,
    role: normalizedRole,
    updated_at: now(),
  })

  return mapMember({
    membership: updatedMembership,
    profile: repositories.profiles.findByUserId(updatedMembership.user_id),
  })
}

export function removeClientMembership({
  membershipId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const membership = repositories.workspaceMemberships.findById(membershipId)

  if (!membership) {
    throw new Error('Membership was not found.')
  }

  if (!canManageClientTeam({ clientId: membership.workspace_id, repositories, viewer })) {
    throw new Error('Only workspace owners can manage members.')
  }

  if (membership.role === WORKSPACE_ROLES.OWNER) {
    const ownerCount = repositories.workspaceMemberships
      .listByWorkspaceId(membership.workspace_id)
      .filter(isActiveWorkspaceMembership)
      .filter((item) => item.role === WORKSPACE_ROLES.OWNER)
      .length

    if (ownerCount <= 1) {
      throw new Error('Transfer ownership to another owner before removing this member.')
    }
  }

  const timestamp = now()

  repositories.workspaceMemberships.upsert({
    ...membership,
    removed_at: timestamp,
    removed_by: viewer.userId,
    status: WORKSPACE_MEMBERSHIP_STATUSES.REMOVED,
    updated_at: timestamp,
  })

  return true
}

export function leaveClientWorkspace({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  if (!viewer?.userId) {
    throw new Error('Only client users can leave a workspace.')
  }

  const client = repositories.workspaces.findById(clientId)

  if (!client) {
    throw new Error('Client was not found.')
  }

  const memberships = repositories.workspaceMemberships
    .listByWorkspaceId(clientId)
    .filter(isActiveWorkspaceMembership)
  const membership = memberships.find((item) => item.user_id === viewer.userId)

  if (!membership || !canAccessWorkspace(viewer, clientId)) {
    throw new Error('You do not have access to this workspace.')
  }

  if (membership.role === WORKSPACE_ROLES.OWNER) {
    const ownerCount = memberships.filter((item) => item.role === WORKSPACE_ROLES.OWNER).length

    if (ownerCount <= 1) {
      throw new Error('Transfer ownership before leaving this workspace.')
    }
  }

  repositories.workspaceMemberships.upsert({
    ...membership,
    removed_at: now(),
    removed_by: viewer.userId,
    status: WORKSPACE_MEMBERSHIP_STATUSES.REMOVED,
  })

  return true
}
