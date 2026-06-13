function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

export function listWorkspaces(apiClient, options = {}) {
  return apiClient.get('/api/workspaces/', options)
}

export function createWorkspace(apiClient, payload, options = {}) {
  return apiClient.post('/api/workspaces/', payload, options)
}

export function getWorkspaceSettings(apiClient, workspaceId, options = {}) {
  return apiClient.get(`/api/workspaces/${encodePathValue(workspaceId)}/settings/`, options)
}

export function updateWorkspaceSettings(apiClient, workspaceId, payload, options = {}) {
  return apiClient.request(`/api/workspaces/${encodePathValue(workspaceId)}/settings/`, {
    ...options,
    body: payload,
    method: 'PATCH',
  })
}
