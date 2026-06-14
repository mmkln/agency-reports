import { getClient } from '@/features/clients'
import {
  getClientAccessOverview,
  normalizeClientAccessOverviewPayload,
} from '@/features/client-access-overview'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

import {
  normalizeAdminClientDetailClient,
} from './adminClientDetailNormalizers'
import {
  getPrimaryWorkspace,
} from './adminClientDetailSelectors'

const EMPTY_CLIENT_DETAIL_RESOURCE = Object.freeze({
  accessPrincipals: [],
  accessWorkspaces: [],
  client: null,
  workspace: null,
})

async function loadAdminClientDetailResource({ apiClient, clientId }) {
  if (!clientId) {
    return EMPTY_CLIENT_DETAIL_RESOURCE
  }

  const [clientPayload, accessOverviewPayload] = await Promise.all([
    getClient(apiClient, clientId),
    getClientAccessOverview(apiClient, clientId),
  ])
  const client = normalizeAdminClientDetailClient(clientPayload)
  const accessOverview = normalizeClientAccessOverviewPayload(accessOverviewPayload)
  const workspace = getPrimaryWorkspace(client)

  return {
    accessPrincipals: accessOverview.principals,
    accessWorkspaces: accessOverview.workspaces,
    client,
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
    accessPrincipals: data.accessPrincipals,
    accessWorkspaces: data.accessWorkspaces,
    client: data.client,
    error: resource.error,
    reload: resource.reload,
    status: resource.status,
    workspace: data.workspace,
  }
}
