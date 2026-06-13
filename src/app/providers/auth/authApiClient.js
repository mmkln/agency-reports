import {
  BackendApiError,
  createBackendApiClient,
  getBackendApiBaseUrl,
} from '../../../shared/api/backendApiClient'

export function getAuthApiBaseUrl() {
  return getBackendApiBaseUrl()
}

export class AuthApiError extends BackendApiError {
  constructor(message, options = {}) {
    super(message, options)
    this.name = 'AuthApiError'
  }
}

export function createAuthApiClient({
  apiClient = null,
  baseUrl = getAuthApiBaseUrl(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const backendClient = apiClient ?? createBackendApiClient({ baseUrl, fetchImpl })

  async function request(...args) {
    try {
      return await backendClient.request(...args)
    } catch (error) {
      if (error instanceof BackendApiError) {
        throw new AuthApiError(error.message, {
          code: error.code,
          detail: error.detail,
          payload: error.payload,
          status: error.status,
        })
      }

      throw error
    }
  }

  return {
    get(path, options = {}) {
      return request(path, { ...options, method: 'GET' })
    },
    post(path, body, options = {}) {
      return request(path, {
        ...options,
        body,
        method: 'POST',
      })
    },
  }
}
