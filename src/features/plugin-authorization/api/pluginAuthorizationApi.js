export function authorizePlugin(apiClient, payload) {
  return apiClient.post('/api/auth/plugin/authorize/', payload)
}
