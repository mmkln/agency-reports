export function syncGhlPipelines(apiClient, workspaceId, sourceConnectionId) {
  return apiClient.post(
    `/api/workspaces/${workspaceId}/source-connections/${sourceConnectionId}/ghl/pipelines/sync/`,
    {},
  )
}

export function syncGhlTags(apiClient, workspaceId, sourceConnectionId) {
  return apiClient.post(
    `/api/workspaces/${workspaceId}/source-connections/${sourceConnectionId}/ghl/tags/sync/`,
    {},
  )
}
