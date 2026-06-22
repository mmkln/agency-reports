import { isActiveWorkspaceMembership, WORKSPACE_ROLE_META, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  CLIENT_REQUEST_STATUSES,
  CLIENT_REQUEST_TYPES,
  normalizeClientRequest,
} from '../../entities/client-request'
import { canAccessWorkspaceResource } from '../policies/accessPolicy'
import { canManageClientTeam } from '../policies/clientTeamPolicy'
import { canRequestWorkspaceDeletion } from '../policies/workspaceAccessPolicy'

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function requireWorkspaceAccess({ workspaceId, repositories, viewer }) {
  const normalizedWorkspaceId = normalizeText(workspaceId || viewer?.activeWorkspaceId)
  const workspace = repositories.workspaces.findById(normalizedWorkspaceId)

  if (!workspace || !canAccessWorkspaceResource(viewer, normalizedWorkspaceId)) {
    throw new Error('You do not have permission to view this workspace.')
  }

  return {
    workspace,
    workspaceId: normalizedWorkspaceId,
  }
}

function mapMembership({ membership, profile }) {
  return {
    email: profile?.email ?? '',
    id: membership.id,
    name: profile?.name ?? 'Unknown member',
    role: membership.role,
    roleLabel: WORKSPACE_ROLE_META[membership.role]?.label ?? membership.role,
    userId: membership.user_id,
  }
}

function getCurrentMembership({ repositories, viewer, workspaceId }) {
  if (!viewer?.userId) {
    return null
  }

  return repositories.workspaceMemberships
    .listByWorkspaceId(workspaceId)
    .filter(isActiveWorkspaceMembership)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

function findOpenBusinessDeletionRequest({ repositories, workspaceId }) {
  return repositories.clientRequests
    ?.listByWorkspaceId(workspaceId)
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
    accessContext = requireWorkspaceAccess({ workspaceId: clientId, repositories, viewer })
  } catch {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const { workspace, workspaceId } = accessContext
  const currentMembership = getCurrentMembership({
    repositories,
    viewer,
    workspaceId,
  })
  const businessDeletionRequest = findOpenBusinessDeletionRequest({
    repositories,
    workspaceId,
  })
  const members = repositories.workspaceMemberships
    .listByWorkspaceId(workspaceId)
    .filter(isActiveWorkspaceMembership)
    .map((membership) => mapMembership({
      membership,
      profile: repositories.profiles.findByUserId(membership.user_id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email))

  return {
    client: {
      id: workspace.id,
      name: workspace.name,
      portalSlug: workspace.portal_slug,
      primaryContactEmail: workspace.primary_contact_email,
      primaryContactName: workspace.primary_contact_name,
    },
    currentMembership: currentMembership
      ? {
          id: currentMembership.id,
          role: currentMembership.role,
          roleLabel: WORKSPACE_ROLE_META[currentMembership.role]?.label ?? currentMembership.role,
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
        canRequestBusinessDeletion: canRequestWorkspaceDeletion(viewer, workspaceId),
      },
      team: {
        allowedInviteRoles: [WORKSPACE_ROLES.VIEWER],
        canManage: canManageClientTeam({
          clientId: workspaceId,
          repositories,
          viewer,
        }),
      },
    },
    status: 'ready',
  }
}
