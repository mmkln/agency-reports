import { CLIENT_MEMBERSHIP_ROLES, isActiveClientMembership } from '../../entities/client-membership'
import {
  CLIENT_REQUEST_STATUSES,
  CLIENT_REQUEST_TYPES,
  normalizeClientRequest,
} from '../../entities/client-request'
import { canAccessClient } from '../policies/accessPolicy'
import { canManageClientTeam } from '../policies/clientTeamPolicy'

const MEMBERSHIP_ROLE_LABELS = Object.freeze({
  [CLIENT_MEMBERSHIP_ROLES.OWNER]: 'Owner',
  [CLIENT_MEMBERSHIP_ROLES.VIEWER]: 'Viewer',
})

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function requireClientAccess({ clientId, repositories, viewer }) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    throw new Error('You do not have permission to view this workspace.')
  }

  return {
    client,
    clientId: normalizedClientId,
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
    .filter(isActiveClientMembership)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

function findOpenBusinessDeletionRequest({ clientId, repositories }) {
  return repositories.clientRequests
    ?.listByClientId(clientId)
    .map(normalizeClientRequest)
    .find((request) => (
      request.request_type === CLIENT_REQUEST_TYPES.BUSINESS_DELETION
      && ![
        CLIENT_REQUEST_STATUSES.ARCHIVED,
        CLIENT_REQUEST_STATUSES.COMPLETED,
        CLIENT_REQUEST_STATUSES.DECLINED,
      ].includes(request.status)
    ))
    ?? null
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
  const currentMembership = getCurrentMembership({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const businessDeletionRequest = findOpenBusinessDeletionRequest({
    clientId: normalizedClientId,
    repositories,
  })
  const members = repositories.clientMemberships
    .listByClientId(normalizedClientId)
    .filter(isActiveClientMembership)
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
    sections: {
      access: {
        businessDeletionRequest: businessDeletionRequest
          ? {
              createdAt: businessDeletionRequest.created_at,
              id: businessDeletionRequest.id,
              status: businessDeletionRequest.status,
              title: businessDeletionRequest.title,
            }
          : null,
        canRequestBusinessDeletion: currentMembership?.role === CLIENT_MEMBERSHIP_ROLES.OWNER,
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
