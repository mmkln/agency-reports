import { BackendApiError, createBackendApiClient } from '../../../shared/api/backendApiClient'
import { createBearerAuthInterceptor } from '../../../shared/api/httpInterceptors'

export function createTokenAuthenticatedApiClient({
  baseApiClient = null,
  createBaseApiClient = createBackendApiClient,
  onSessionExpired,
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
  let refreshPromise = null

  function isAuthError(error) {
    return error instanceof BackendApiError && error.status === 401
  }

  function createSessionExpiredError(error) {
    return new BackendApiError('Your session expired. Sign in again.', {
      code: 'session_expired',
      detail: error?.detail ?? null,
      payload: error?.payload ?? null,
      status: 401,
    })
  }

  function expireSession(error) {
    const sessionExpiredError = createSessionExpiredError(error)

    tokenStorage.clear()
    onSessionExpired?.(sessionExpiredError)

    return sessionExpiredError
  }

  async function refreshTokens() {
    const refresh = tokenStorage.read()?.refresh
    if (!refresh) {
      return null
    }

    const response = await rawApiClient.post(refreshPath, { refresh }, { skipAuth: true })
    return tokenStorage.write(response)
  }

  function refreshTokensOnce() {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null
      })
    }

    return refreshPromise
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
      ) {
        throw error
      }

      try {
        const refreshedTokens = await refreshTokensOnce()

        if (!refreshedTokens) {
          throw expireSession(error)
        }
      } catch (refreshError) {
        if (refreshError instanceof BackendApiError && refreshError.code === 'session_expired') {
          throw refreshError
        }

        throw expireSession(refreshError)
      }

      try {
        return await authenticatedApiClient.request(path, {
          ...options,
          didRefresh: true,
        })
      } catch (retryError) {
        if (isAuthError(retryError)) {
          throw expireSession(retryError)
        }

        throw retryError
      }
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
