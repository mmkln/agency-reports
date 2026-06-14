function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

export function listWorkspaceMemberships(apiClient, workspaceId, options = {}) {
  return apiClient.get(`/api/workspaces/${encodePathValue(workspaceId)}/memberships/`, options)
}

export function removeWorkspaceMembership(apiClient, workspaceId, membershipId, options = {}) {
  return apiClient.request(
    `/api/workspaces/${encodePathValue(workspaceId)}/memberships/${encodePathValue(membershipId)}/`,
    {
      ...options,
      method: 'DELETE',
    },
  )
}
