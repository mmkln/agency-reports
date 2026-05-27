import { describe, expect, it, vi } from 'vitest'

import { createAuthApiClient } from './authApiClient'

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

describe('createAuthApiClient', () => {
  it('sends credentialed requests to the configured API base URL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      data: { ok: true },
    }))
    const client = createAuthApiClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl,
    })

    await expect(client.get('/api/auth/me/')).resolves.toEqual({ ok: true })

    expect(fetchImpl).toHaveBeenCalledWith('http://127.0.0.1:8000/api/auth/me/', {
      body: undefined,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    })
  })

  it('sends JSON body and credentials for POST requests', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(createJsonResponse({
      data: { ok: true },
    }))
    const client = createAuthApiClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl,
    })

    await client.post('/api/auth/login/', {
      password: 'secret',
      username: 'admin',
    })

    expect(fetchImpl).toHaveBeenCalledWith('http://127.0.0.1:8000/api/auth/login/', expect.objectContaining({
      body: JSON.stringify({
        password: 'secret',
        username: 'admin',
      }),
      credentials: 'include',
      method: 'POST',
    }))
  })
})
