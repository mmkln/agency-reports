function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

export function getInvitationByToken(apiClient, token, options = {}) {
  return apiClient.get(`/api/invitations/${encodePathValue(token)}/`, options)
}

export function acceptInvitation(apiClient, token, payload, options = {}) {
  return apiClient.post(`/api/invitations/${encodePathValue(token)}/accept/`, payload, options)
}

export function listWorkspaceInvitations(apiClient, workspaceId, options = {}) {
  return apiClient.get(`/api/workspaces/${encodePathValue(workspaceId)}/invitations/`, options)
}

export function createWorkspaceInvitation(apiClient, workspaceId, payload, options = {}) {
  return apiClient.post(`/api/workspaces/${encodePathValue(workspaceId)}/invitations/`, payload, options)
}

export function cancelWorkspaceInvitation(apiClient, workspaceId, invitationId, options = {}) {
  return apiClient.post(
    `/api/workspaces/${encodePathValue(workspaceId)}/invitations/${encodePathValue(invitationId)}/cancel/`,
    {},
    options,
  )
}

export function resendWorkspaceInvitation(apiClient, workspaceId, invitationId, options = {}) {
  return apiClient.post(
    `/api/workspaces/${encodePathValue(workspaceId)}/invitations/${encodePathValue(invitationId)}/resend/`,
    {},
    options,
  )
}
