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
  baseUrl = getAuthApiBaseUrl(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const backendClient = createBackendApiClient({ baseUrl, fetchImpl })

  async function request(...args) {
    try {
      return await backendClient.request(...args)
    } catch (error) {
      if (error instanceof BackendApiError) {
        throw new AuthApiError(error.message, {
          detail: error.detail,
          payload: error.payload,
          status: error.status,
        })
      }

      throw error
    }
  }

  return {
    get(path) {
      return request(path, { method: 'GET' })
    },
    post(path, body) {
      return request(path, {
        body,
        method: 'POST',
        requiresCsrf: true,
      })
    },
  }
}
