const DEFAULT_SNAPSHOT_PATH = '/api/portal-snapshot'

function joinUrl(baseUrl, path) {
  const normalizedBaseUrl = String(baseUrl ?? '').replace(/\/+$/, '')
  const normalizedPath = String(path ?? '').startsWith('/') ? path : `/${path}`

  return `${normalizedBaseUrl}${normalizedPath}`
}

function createJsonHeaders(headers = {}) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  }
}

function getResponseMessage(status) {
  if (status === 401 || status === 403) {
    return 'Portal API authentication failed.'
  }

  if (status === 409) {
    return 'Snapshot version conflict. Reload before saving again.'
  }

  return `Portal API request failed with status ${status}.`
}

async function parseJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    throw new Error('Portal API returned malformed JSON.')
  }
}

async function assertOkResponse(response) {
  if (response.ok) {
    return
  }

  throw new Error(getResponseMessage(response.status))
}

function assertSnapshotPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Portal API returned an invalid snapshot payload.')
  }

  if (!Object.hasOwn(payload, 'snapshot')) {
    throw new Error('Portal API returned an invalid snapshot payload.')
  }
}

function resolveFetch(fetchImpl) {
  const resolvedFetch = fetchImpl ?? globalThis.fetch

  if (typeof resolvedFetch !== 'function') {
    throw new Error('fetch implementation is required for the HTTP portal transport.')
  }

  return resolvedFetch
}

export function createHttpPortalSnapshotTransport({
  baseUrl = '',
  fetchImpl,
  getHeaders = () => ({}),
  snapshotPath = DEFAULT_SNAPSHOT_PATH,
} = {}) {
  const requestUrl = joinUrl(baseUrl, snapshotPath)

  async function request(method, body = null) {
    const resolvedFetch = resolveFetch(fetchImpl)
    const response = await resolvedFetch(requestUrl, {
      body: body ? JSON.stringify(body) : undefined,
      headers: createJsonHeaders(getHeaders()),
      method,
    })

    await assertOkResponse(response)

    return parseJsonResponse(response)
  }

  return {
    async loadSnapshot() {
      const payload = await request('GET')

      assertSnapshotPayload(payload)

      return {
        snapshot: payload.snapshot,
        version: payload.version ?? null,
      }
    },
    async saveSnapshot(snapshot, { version } = {}) {
      const payload = await request('PUT', {
        snapshot,
        version: version ?? null,
      })

      return {
        version: payload?.version ?? null,
      }
    },
  }
}

export function getPortalApiBaseUrl(env = import.meta.env) {
  return env?.VITE_PORTAL_API_BASE_URL ?? ''
}
