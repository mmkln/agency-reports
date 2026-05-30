const LOCAL_API_BASE_URL = 'http://127.0.0.1:8000'
const LOCAL_BACKEND_PORT = '8000'
const MISSING_REMOTE_API_BASE_URL_MESSAGE = [
  'VITE_API_BASE_URL is required for deployed builds.',
  'Set it to the remote backend origin before building the frontend.',
].join(' ')

function getDefaultApiBaseUrl() {
  if (typeof window === 'undefined') {
    return LOCAL_API_BASE_URL
  }

  const { hostname, protocol } = window.location

  if (isLocalHostname(hostname)) {
    return `${protocol}//${hostname}:${LOCAL_BACKEND_PORT}`
  }

  throw new Error(MISSING_REMOTE_API_BASE_URL_MESSAGE)
}

export function getBackendApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  return (configuredBaseUrl || getDefaultApiBaseUrl()).replace(/\/$/, '')
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export function getCookie(name) {
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

export class BackendApiError extends Error {
  constructor(message, {
    detail = null,
    payload = null,
    status = 0,
  } = {}) {
    super(message)
    this.name = 'BackendApiError'
    this.detail = detail
    this.payload = payload
    this.status = status
  }
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

function appendQuery(url, query = {}) {
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          url.searchParams.append(key, String(item))
        }
      })
      return
    }

    url.searchParams.set(key, String(value))
  })
}

async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch (error) {
    throw new BackendApiError('Backend returned malformed JSON.', {
      detail: error.message,
      status: response.status,
    })
  }
}

function getDefaultErrorMessage(status, payload) {
  if (payload?.detail) {
    return payload.detail
  }

  if (payload?.error) {
    return payload.error
  }

  if (status === 401) {
    return 'Authentication required.'
  }

  if (status === 403) {
    return 'You do not have access to this resource.'
  }

  if (status === 404) {
    return 'Requested resource was not found.'
  }

  if (status === 409) {
    return 'The resource changed. Reload and try again.'
  }

  return 'Backend request failed.'
}

export function createBackendApiClient({
  baseUrl = getBackendApiBaseUrl(),
  fetchImpl = globalThis.fetch,
} = {}) {
  async function request(path, {
    body,
    method = 'GET',
    query,
    requiresCsrf = false,
  } = {}) {
    const url = new URL(`${baseUrl}${normalizePath(path)}`)
    appendQuery(url, query)

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

    const response = await fetchImpl(url.toString(), {
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      headers,
      method,
    })
    const payload = await readJsonResponse(response)

    if (!response.ok) {
      throw new BackendApiError(getDefaultErrorMessage(response.status, payload), {
        payload,
        status: response.status,
      })
    }

    return payload
  }

  return {
    get(path, options = {}) {
      return request(path, {
        ...options,
        method: 'GET',
      })
    },
    post(path, body, options = {}) {
      return request(path, {
        ...options,
        body,
        method: 'POST',
        requiresCsrf: options.requiresCsrf ?? true,
      })
    },
    request,
  }
}
