import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import { canManageClientTeam } from '../policies/clientTeamPolicy'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MEMBERSHIP_ROLE_LABELS = Object.freeze({
  [CLIENT_MEMBERSHIP_ROLES.OWNER]: 'Owner',
  [CLIENT_MEMBERSHIP_ROLES.VIEWER]: 'Viewer',
})

const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLES.AGENCY_ADMIN]: 'Agency admin',
  [USER_ROLES.AGENCY_TEAM]: 'Agency team',
  [USER_ROLES.CLIENT_ADMIN]: 'Client admin',
  [USER_ROLES.CLIENT_TEAM]: 'Client team',
})

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeEmail(value = '') {
  return normalizeText(value).toLowerCase()
}

function requireClientAccess({ clientId, repositories, viewer }) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    throw new Error('You do not have permission to view this client portal.')
  }

  return {
    client,
    clientId: normalizedClientId,
  }
}

function mapProfile({ profile, viewer }) {
  return {
    email: profile?.email ?? viewer.email ?? '',
    name: profile?.name ?? viewer.name ?? '',
    role: profile?.role ?? viewer.role,
    roleLabel: USER_ROLE_LABELS[profile?.role ?? viewer.role] ?? (profile?.role ?? viewer.role),
    userId: viewer.userId,
  }
}

function mapMembership({ membership, profile }) {
  return {
    email: profile?.email ?? '',
    id: membership.id,
    name: profile?.name ?? 'Unknown member',
    role: membership.role,
    roleLabel: MEMBERSHIP_ROLE_LABELS[membership.role] ?? membership.role,
    userId: membership.user_id,
  }
}

function getCurrentMembership({ clientId, repositories, viewer }) {
  if (!viewer?.userId) {
    return null
  }

  return repositories.clientMemberships
    .listByClientId(clientId)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

export function getClientSettingsPage({
  clientId,
  repositories,
  viewer,
}) {
  let accessContext

  try {
    accessContext = requireClientAccess({ clientId, repositories, viewer })
  } catch {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const { client, clientId: normalizedClientId } = accessContext
  const profile = repositories.profiles.findByUserId(viewer.userId)
  const currentMembership = getCurrentMembership({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const members = repositories.clientMemberships
    .listByClientId(normalizedClientId)
    .map((membership) => mapMembership({
      membership,
      profile: repositories.profiles.findByUserId(membership.user_id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email))

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
    },
    currentMembership: currentMembership
      ? {
          id: currentMembership.id,
          role: currentMembership.role,
          roleLabel: MEMBERSHIP_ROLE_LABELS[currentMembership.role] ?? currentMembership.role,
        }
      : null,
    members,
    profile: mapProfile({ profile, viewer }),
    sections: {
      notifications: {
        isAvailable: false,
        message: 'Notification preferences are managed by the agency until notification delivery is implemented.',
      },
      security: {
        isAvailable: false,
        message: 'Password and session controls are not exposed in this client portal yet.',
      },
      team: {
        allowedInviteRoles: [CLIENT_MEMBERSHIP_ROLES.VIEWER],
        canManage: canManageClientTeam({
          clientId: normalizedClientId,
          repositories,
          viewer,
        }),
      },
    },
    status: 'ready',
  }
}

export function updateClientProfileSettings({
  clientId,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireClientAccess({ clientId, repositories, viewer })

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

  return mapProfile({ profile: updatedProfile, viewer })
}
