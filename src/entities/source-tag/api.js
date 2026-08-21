import { normalizeSourceTagCatalog } from './apiContract'

export function getWorkspaceTagCatalog(apiClient, workspaceId) {
  return apiClient.get(`/api/workspaces/${workspaceId}/tag-catalog/`)
    .then(normalizeSourceTagCatalog)
}
