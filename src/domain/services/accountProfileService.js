import { AGENCY_ROLE_META } from '../../entities/agency-membership'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeEmail(value = '') {
  return normalizeText(value).toLowerCase()
}

function requireAuthenticatedViewer(viewer) {
  if (!viewer?.userId) {
    throw new Error('You must be signed in to manage account settings.')
  }
}

function findActiveAgencyMembership(viewer) {
  const memberships = viewer?.agencyMemberships ?? []

  return memberships.find((membership) => membership.agencyId === viewer?.activeAgencyId)
    ?? memberships[0]
    ?? null
}

function findActiveWorkspaceMembership(viewer) {
  const memberships = viewer?.workspaceMemberships ?? []

  return memberships.find((membership) => membership.workspaceId === viewer?.activeWorkspaceId)
    ?? memberships[0]
    ?? null
}

function getPrimaryAccessMembership(viewer) {
  const agencyMembership = findActiveAgencyMembership(viewer)

  if (agencyMembership) {
    return {
      role: agencyMembership.role,
      roleLabel: AGENCY_ROLE_META[agencyMembership.role]?.label ?? agencyMembership.role,
      type: 'agency',
    }
  }

  const workspaceMembership = findActiveWorkspaceMembership(viewer)

  if (workspaceMembership) {
    return {
      role: workspaceMembership.role,
      roleLabel: WORKSPACE_ROLE_META[workspaceMembership.role]?.label ?? workspaceMembership.role,
      type: 'workspace',
    }
  }

  return {
    role: null,
    roleLabel: 'No active membership',
    type: null,
  }
}

export function mapAccountProfile({ profile, viewer }) {
  const accessMembership = getPrimaryAccessMembership(viewer)

  return {
    accessType: accessMembership.type,
    email: profile?.email ?? viewer?.email ?? '',
    name: profile?.name ?? viewer?.name ?? '',
    role: accessMembership.role,
    roleLabel: accessMembership.roleLabel,
    userId: viewer?.userId ?? profile?.user_id ?? null,
  }
}

export function getOwnProfileSettings({
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile) {
    throw new Error('Profile was not found.')
  }

  return mapAccountProfile({ profile, viewer })
}

export function updateOwnProfileSettings({
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile) {
    throw new Error('Profile was not found.')
  }

  const name = normalizeText(input?.name)
  const email = normalizeEmail(input?.email)

  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters.')
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Email must be a valid email address.')
  }

  const duplicateProfile = repositories.profiles
    .list()
    .find((candidate) => (
      candidate.user_id !== viewer.userId
      && String(candidate.email ?? '').toLowerCase() === email
    ))

  if (duplicateProfile) {
    throw new Error('Email is already used by another account.')
  }

  const updatedProfile = repositories.profiles.upsert({
    ...profile,
    email,
    name,
    updated_at: now(),
  })

  return mapAccountProfile({ profile: updatedProfile, viewer })
}
