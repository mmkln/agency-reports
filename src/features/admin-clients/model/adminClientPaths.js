import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { ROUTE_PATHS, withSearchParams } from '../../../domain/navigation/routePaths'

export function getClientAccountWorkspacesPath(clientId) {
  return withSearchParams(ROUTE_PATHS.agencyWorkspaces, { clientAccountId: clientId })
}

export function getWorkspaceAdminPath(workspace, client) {
  if (workspace?.id) {
    return getDefaultWorkspaceAdminPath(workspace)
  }

  return getClientAccountWorkspacesPath(client.id)
}

export function getAdminClientsPath(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  return withSearchParams(ROUTE_PATHS.agencyClients, Object.fromEntries(search.entries()))
}
