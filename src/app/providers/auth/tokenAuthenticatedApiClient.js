import { BackendApiError, createBackendApiClient } from '../../../shared/api/backendApiClient'
import { createBearerAuthInterceptor } from '../../../shared/api/httpInterceptors'

export function createTokenAuthenticatedApiClient({
  baseApiClient = null,
  createBaseApiClient = createBackendApiClient,
  refreshPath = '/api/auth/refresh/',
  tokenStorage,
} = {}) {
  const rawApiClient = baseApiClient ?? createBaseApiClient()
  const authenticatedApiClient = createBaseApiClient({
    requestInterceptors: [
      createBearerAuthInterceptor({
        getToken: () => tokenStorage.read()?.access ?? '',
      }),
    ],
  })

  async function refreshTokens() {
    const refresh = tokenStorage.read()?.refresh
    if (!refresh) {
      tokenStorage.clear()
      return null
    }

    try {
      const response = await rawApiClient.post(refreshPath, { refresh }, { skipAuth: true })
      return tokenStorage.write(response)
    } catch (error) {
      tokenStorage.clear()
      if (error instanceof BackendApiError && error.status === 401) {
        return null
      }

      throw error
    }
  }

  async function requestWithRefresh(path, options = {}) {
    try {
      return await authenticatedApiClient.request(path, options)
    } catch (error) {
      if (
        options.skipAuth
        || options.didRefresh
        || !(error instanceof BackendApiError)
        || error.status !== 401
        || !await refreshTokens()
      ) {
        throw error
      }

      return authenticatedApiClient.request(path, {
        ...options,
        didRefresh: true,
      })
    }
  }

  return {
    get(path, options = {}) {
      return requestWithRefresh(path, {
        ...options,
        method: 'GET',
      })
    },
    post(path, body, options = {}) {
      return requestWithRefresh(path, {
        ...options,
        body,
        method: 'POST',
      })
    },
    request: requestWithRefresh,
  }
}
