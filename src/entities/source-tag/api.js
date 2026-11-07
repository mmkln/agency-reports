import { normalizeSourceTagCatalog } from './apiContract'

export function getWorkspaceTagCatalog(apiClient, workspaceId) {
  return apiClient.get(`/api/workspaces/${workspaceId}/tag-catalog/`)
    .then(normalizeSourceTagCatalog)
}

export function updateWorkspaceTagDescription(
  apiClient,
  workspaceId,
  tagId,
  description,
) {
  return apiClient.request(
    `/api/workspaces/${workspaceId}/tag-catalog/${tagId}/`,
    {
      body: { description },
      method: 'PATCH',
    },
  )
}
