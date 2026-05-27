const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export function getAuthApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function getCookie(name) {
  if (typeof document === 'undefined') {
    return ''
  }

  const prefix = `${name}=`
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length) ?? ''
}

export class AuthApiError extends Error {
  constructor(message, { status } = {}) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

export function createAuthApiClient({
  baseUrl = getAuthApiBaseUrl(),
  fetchImpl = globalThis.fetch,
} = {}) {
  async function request(path, {
    body,
    method = 'GET',
    requiresCsrf = false,
  } = {}) {
    const headers = {
      Accept: 'application/json',
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (requiresCsrf) {
      const csrfToken = getCookie('csrftoken')
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken
      }
    }

    const response = await fetchImpl(`${baseUrl}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      headers,
      method,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : null

    if (!response.ok) {
      throw new AuthApiError(data?.detail ?? 'Authentication request failed.', {
        status: response.status,
      })
    }

    return data
  }

  return {
    get(path) {
      return request(path)
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
