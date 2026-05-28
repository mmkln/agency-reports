import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  BackendApiError,
  createBackendApiClient,
  getBackendApiBaseUrl,
} from './backendApiClient'

function createJsonResponse({ ok = true, status = 200, data = {} } = {}) {
  return {
    headers: {
      get: () => 'application/json',
    },
    json: () => Promise.resolve(data),
    ok,
    status,
  }
}

describe('createBackendApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the current local hostname for the default backend URL', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'localhost',
        protocol: 'http:',
      },
    })

    expect(getBackendApiBaseUrl()).toBe('http://localhost:8000')
  })

  it('sends credentialed GET requests with query parameters', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      data: { ok: true },
    }))
    const client = createBackendApiClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl,
    })

    await expect(client.get('/api/example/', {
      query: {
        empty: '',
        end: '2026-05-17',
        start: '2026-05-11',
      },
    })).resolves.toEqual({ ok: true })

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/example/?end=2026-05-17&start=2026-05-11',
      {
        body: undefined,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
      },
    )
  })

  it('normalizes backend errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      data: { detail: 'No access.' },
      ok: false,
      status: 403,
    }))
    const client = createBackendApiClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl,
    })

    await expect(client.get('/api/private/')).rejects.toMatchObject({
      message: 'No access.',
      name: 'BackendApiError',
      status: 403,
    })
  })

  it('reports malformed JSON as a controlled error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.reject(new Error('Unexpected token')),
      ok: true,
      status: 200,
    })
    const client = createBackendApiClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl,
    })

    await expect(client.get('/api/broken/')).rejects.toBeInstanceOf(BackendApiError)
  })
})
