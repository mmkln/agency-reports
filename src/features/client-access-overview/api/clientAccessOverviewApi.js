function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

export function getClientAccessOverview(apiClient, clientId, options = {}) {
  return apiClient.get(`/api/clients/${encodePathValue(clientId)}/access-overview/`, options)
}
