import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

const MEMBERSHIP_ROLE_LABELS = Object.freeze({
  [CLIENT_MEMBERSHIP_ROLES.OWNER]: 'Owner',
  [CLIENT_MEMBERSHIP_ROLES.VIEWER]: 'Viewer',
})

const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLES.AGENCY_ADMIN]: 'Agency admin',
  [USER_ROLES.AGENCY_TEAM]: 'Agency team',
  [USER_ROLES.CLIENT_USER]: 'Client user',
})

function normalizeText(value = '') {
  return String(value ?? '').trim()
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
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

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
    profile: {
      email: viewer.email ?? '',
      name: viewer.name ?? '',
      role: viewer.role,
      roleLabel: USER_ROLE_LABELS[viewer.role] ?? viewer.role,
      userId: viewer.userId,
    },
    sections: {
      notifications: {
        isAvailable: false,
        message: 'Notification preferences are managed by the agency until notification delivery is implemented.',
      },
      security: {
        isAvailable: false,
        message: 'Password and session controls are not exposed in this client portal yet.',
      },
    },
    status: 'ready',
  }
}
