import { getClient } from '@/features/clients'
import { listWorkspaceInvitations } from '@/features/invitations'
import { listWorkspaceMemberships } from '@/entities/workspace-membership'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

import {
  normalizeAdminClientDetailClient,
  normalizeWorkspaceInvitationsPayload,
  normalizeWorkspaceMembershipsPayload,
} from './adminClientDetailNormalizers'
import {
  getPrimaryWorkspace,
  selectActiveWorkspaceMemberships,
  selectPendingWorkspaceInvitations,
} from './adminClientDetailSelectors'

const EMPTY_CLIENT_DETAIL_RESOURCE = Object.freeze({
  client: null,
  invitations: [],
  memberships: [],
  workspace: null,
})

async function loadAdminClientDetailResource({ apiClient, clientId }) {
  if (!clientId) {
    return EMPTY_CLIENT_DETAIL_RESOURCE
  }

  const clientPayload = await getClient(apiClient, clientId)
  const client = normalizeAdminClientDetailClient(clientPayload)
  const workspace = getPrimaryWorkspace(client)

  if (!workspace?.id) {
    return {
      client,
      invitations: [],
      memberships: [],
      workspace,
    }
  }

  const [membershipsPayload, invitationsPayload] = await Promise.all([
    listWorkspaceMemberships(apiClient, workspace.id),
    listWorkspaceInvitations(apiClient, workspace.id),
  ])

  return {
    client,
    invitations: normalizeWorkspaceInvitationsPayload(invitationsPayload),
    memberships: normalizeWorkspaceMembershipsPayload(membershipsPayload),
    workspace,
  }
}

export function useAdminClientDetailResource({ apiClient, clientId }) {
  const resource = useAsyncResource({
    dependencyKey: `admin-client-detail:${clientId}`,
    initialData: EMPTY_CLIENT_DETAIL_RESOURCE,
    load: () => loadAdminClientDetailResource({ apiClient, clientId }),
  })
  const data = resource.data ?? EMPTY_CLIENT_DETAIL_RESOURCE

  return {
    client: data.client,
    error: resource.error,
    invitations: selectPendingWorkspaceInvitations(data.invitations),
    memberships: selectActiveWorkspaceMemberships(data.memberships),
    reload: resource.reload,
    status: resource.status,
    workspace: data.workspace,
  }
}
