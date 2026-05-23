import { describe, expect, it, vi } from 'vitest'

import {
  createHttpPortalSnapshotTransport,
  getPortalApiBaseUrl,
} from './createHttpPortalSnapshotTransport'

function createJsonResponse(body, {
  ok = true,
  status = ok ? 200 : 500,
} = {}) {
  return {
    async json() {
      return body
    },
    ok,
    status,
  }
}

describe('createHttpPortalSnapshotTransport', () => {
  it('loads snapshot payloads from the configured API endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      snapshot: {
        clients: [
          {
            id: 'client-1',
          },
        ],
      },
      version: 'version-1',
    }))
    const transport = createHttpPortalSnapshotTransport({
      baseUrl: 'https://api.example.test',
      fetchImpl,
    })

    await expect(transport.loadSnapshot()).resolves.toEqual({
      snapshot: {
        clients: [
          {
            id: 'client-1',
          },
        ],
      },
      version: 'version-1',
    })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.example.test/api/portal-snapshot', {
      body: undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
  })

  it('saves snapshot payloads with optimistic version context', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      version: 'version-2',
    }))
    const transport = createHttpPortalSnapshotTransport({
      baseUrl: 'https://api.example.test/',
      fetchImpl,
      getHeaders: () => ({
        Authorization: 'Bearer test-token',
      }),
      snapshotPath: 'portal-snapshot',
    })

    await expect(transport.saveSnapshot({
      clients: [],
    }, {
      version: 'version-1',
    })).resolves.toEqual({
      version: 'version-2',
    })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.example.test/portal-snapshot', {
      body: JSON.stringify({
        snapshot: {
          clients: [],
        },
        version: 'version-1',
      }),
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
  })

  it('maps stale writes to a version conflict error', async () => {
    const transport = createHttpPortalSnapshotTransport({
      fetchImpl: vi.fn().mockResolvedValue(createJsonResponse({}, {
        ok: false,
        status: 409,
      })),
    })

    await expect(transport.saveSnapshot({}, {
      version: 'stale-version',
    })).rejects.toThrow('Snapshot version conflict. Reload before saving again.')
  })

  it('maps auth failures to controlled errors', async () => {
    const transport = createHttpPortalSnapshotTransport({
      fetchImpl: vi.fn().mockResolvedValue(createJsonResponse({}, {
        ok: false,
        status: 401,
      })),
    })

    await expect(transport.loadSnapshot()).rejects.toThrow('Portal API authentication failed.')
  })

  it('rejects malformed snapshot payloads', async () => {
    const transport = createHttpPortalSnapshotTransport({
      fetchImpl: vi.fn().mockResolvedValue(createJsonResponse({
        data: {},
      })),
    })

    await expect(transport.loadSnapshot()).rejects.toThrow('Portal API returned an invalid snapshot payload.')
  })

  it('rejects malformed JSON responses', async () => {
    const transport = createHttpPortalSnapshotTransport({
      fetchImpl: vi.fn().mockResolvedValue({
        async json() {
          throw new Error('bad json')
        },
        ok: true,
        status: 200,
      }),
    })

    await expect(transport.loadSnapshot()).rejects.toThrow('Portal API returned malformed JSON.')
  })

  it('requires a fetch implementation', async () => {
    const transport = createHttpPortalSnapshotTransport({
      fetchImpl: null,
    })
    const originalFetch = globalThis.fetch

    try {
      globalThis.fetch = undefined

      await expect(transport.loadSnapshot()).rejects.toThrow(
        'fetch implementation is required for the HTTP portal transport.',
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

describe('getPortalApiBaseUrl', () => {
  it('reads the configured API base URL from Vite env', () => {
    expect(getPortalApiBaseUrl({
      VITE_PORTAL_API_BASE_URL: 'https://api.example.test',
    })).toBe('https://api.example.test')
  })

  it('defaults to a relative API path when no base URL is configured', () => {
    expect(getPortalApiBaseUrl({})).toBe('')
  })
})
