import { CLIENT_TYPES } from '../../entities/client'
import {
  AGENCY_WORKSPACE_RELATIONSHIP_STATUSES,
} from '../../entities/agency-workspace-relationship'
import {
  isActiveWorkspaceMembership,
} from '../../entities/workspace-membership/model'
import {
  canManageAgencyWorkspace,
  canManageAgencyWorkspaceAccess,
} from '../policies/agencyAccessPolicy'
import {
  canAccessWorkspace,
  canManageWorkspaceMembers,
  canManageWorkspaceSettings,
} from '../policies/workspaceAccessPolicy'

function getRecordWorkspaceId(record) {
  return record?.workspace_id ?? record?.workspaceId ?? record?.client_id ?? record?.clientId ?? null
}

function getRecordAgencyId(record) {
  return record?.agency_id ?? record?.agencyId ?? null
}

function getRecordUserId(record) {
  return record?.user_id ?? record?.userId ?? null
}

function listRepositoryRecords(repository) {
  return repository?.list?.() ?? []
}

function hasCurrentWorkspaceMembership({ repositories, viewer, workspaceId }) {
  return listRepositoryRecords(repositories.workspaceMemberships)
    .some((membership) => (
      getRecordUserId(membership) === viewer?.userId
      && getRecordWorkspaceId(membership) === workspaceId
      && isActiveWorkspaceMembership(membership)
    ))
}

function hasCurrentAgencyWorkspaceRelationship({ repositories, viewer, workspaceId }) {
  const activeAgencyIds = new Set((viewer?.agencyMemberships ?? []).map((membership) => membership.agencyId))

  return listRepositoryRecords(repositories.agencyWorkspaceRelationships)
    .some((relationship) => (
      activeAgencyIds.has(getRecordAgencyId(relationship))
      && getRecordWorkspaceId(relationship) === workspaceId
      && relationship.status === AGENCY_WORKSPACE_RELATIONSHIP_STATUSES.ACTIVE
    ))
}

export function getRouteAccessClientContext({
  clientId,
  repositories,
  viewer = null,
}) {
  if (!clientId) {
    return {
      canManageWorkspace: false,
      canManageWorkspaceAccess: false,
      canManageWorkspaceMembers: false,
      canManageWorkspaceSettings: false,
      canViewWorkspacePortal: false,
      clientId: null,
      clientType: CLIENT_TYPES.GENERIC,
      workspaceId: null,
      workspaceType: CLIENT_TYPES.GENERIC,
    }
  }

  const client = repositories.workspaces.findById(clientId)
  const workspaceType = client?.type ?? CLIENT_TYPES.GENERIC
  const hasWorkspaceMembership = hasCurrentWorkspaceMembership({ repositories, viewer, workspaceId: clientId })
  const hasAgencyWorkspaceRelationship = hasCurrentAgencyWorkspaceRelationship({ repositories, viewer, workspaceId: clientId })
  const canManageWorkspace = hasAgencyWorkspaceRelationship && canManageAgencyWorkspace(viewer, clientId)
  const canViewWorkspacePortal = hasWorkspaceMembership && canAccessWorkspace(viewer, clientId)

  return {
    canManageWorkspace,
    canManageWorkspaceAccess: canManageWorkspace && canManageAgencyWorkspaceAccess(viewer, clientId),
    canManageWorkspaceMembers: hasWorkspaceMembership && canManageWorkspaceMembers(viewer, clientId),
    canManageWorkspaceSettings: hasWorkspaceMembership && canManageWorkspaceSettings(viewer, clientId),
    canViewWorkspacePortal,
    clientId,
    clientType: workspaceType,
    workspaceId: clientId,
    workspaceType,
  }
}
