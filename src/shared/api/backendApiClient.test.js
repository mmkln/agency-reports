import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBackendApiClient } from './backendApiClient'
import { createBearerAuthInterceptor } from './httpInterceptors'

function createJsonResponse(payload = {}) {
  return {
    headers: {
      get(name) {
        return name === 'content-type' ? 'application/json' : null
      },
    },
    json: () => Promise.resolve(payload),
    ok: true,
    status: 200,
  }
}

describe('createBackendApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds the bearer token when an auth token is available', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(createJsonResponse({ ok: true })))
    const client = createBackendApiClient({
      baseUrl: 'https://mxllagency.pythonanywhere.com',
      fetchImpl,
      requestInterceptors: [
        createBearerAuthInterceptor({
          getToken: () => 'access-token',
        }),
      ],
    })

    await client.get('/api/auth/me/')

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://mxllagency.pythonanywhere.com/api/auth/me/',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    )
  })

  it('omits the bearer token when auth is skipped', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(createJsonResponse({ ok: true })))
    const client = createBackendApiClient({
      baseUrl: 'https://mxllagency.pythonanywhere.com',
      fetchImpl,
      requestInterceptors: [
        createBearerAuthInterceptor({
          getToken: () => 'access-token',
        }),
      ],
    })

    await client.post('/api/auth/login/', {
      email: 'owner@example.com',
      password: 'secret',
    }, { skipAuth: true })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://mxllagency.pythonanywhere.com/api/auth/login/',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'owner@example.com',
          password: 'secret',
        }),
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        method: 'POST',
      }),
    )
    expect(fetchImpl.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
  })

  it('keeps requests unauthenticated when no auth interceptor is configured', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(createJsonResponse({ ok: true })))
    const client = createBackendApiClient({
      baseUrl: 'https://mxllagency.pythonanywhere.com',
      fetchImpl,
    })

    await client.post('/api/auth/login/', {
      email: 'owner@example.com',
      password: 'secret',
    })

    const [, options] = fetchImpl.mock.calls[0]

    expect(options).not.toHaveProperty('credentials')
    expect(options.headers).not.toHaveProperty('Authorization')
  })
})
