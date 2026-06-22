function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

export function listClients(apiClient, options = {}) {
  return apiClient.get('/api/clients/', options)
}

export function getClient(apiClient, clientId, options = {}) {
  return apiClient.get(`/api/clients/${encodePathValue(clientId)}/`, options)
}

export function createClient(apiClient, payload, options = {}) {
  return apiClient.post('/api/clients/', payload, options)
}

export function updateClient(apiClient, clientId, payload, options = {}) {
  return apiClient.request(`/api/clients/${encodePathValue(clientId)}/`, {
    ...options,
    body: payload,
    method: 'PATCH',
  })
}
