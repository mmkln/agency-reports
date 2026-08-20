export function syncGhlPipelines(apiClient, workspaceId, sourceConnectionId) {
  return apiClient.post(
    `/api/workspaces/${workspaceId}/source-connections/${sourceConnectionId}/ghl/pipelines/sync/`,
    {},
  )
}
