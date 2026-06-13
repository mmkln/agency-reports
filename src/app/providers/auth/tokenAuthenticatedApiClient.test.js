import { describe, expect, it, vi } from 'vitest'

import { BackendApiError } from '../../../shared/api/backendApiClient'
import { createTokenAuthenticatedApiClient } from './tokenAuthenticatedApiClient'

function createMemoryTokenStorage(initialTokens = null) {
  let tokens = initialTokens

  return {
    clear: vi.fn(() => {
      tokens = null
    }),
    read: vi.fn(() => tokens),
    write: vi.fn((nextTokens) => {
      tokens = {
        access: nextTokens.access,
        refresh: nextTokens.refresh,
      }
      return tokens
    }),
  }
}

describe('createTokenAuthenticatedApiClient', () => {
  it('sends protected requests through the authenticated API client', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'access-token',
      refresh: 'refresh-token',
    })
    const protectedApiClient = {
      request: vi.fn(() => Promise.resolve({ ok: true })),
    }
    const rawApiClient = {
      post: vi.fn(),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      tokenStorage,
    })

    await expect(client.get('/api/clients/')).resolves.toEqual({ ok: true })

    expect(protectedApiClient.request).toHaveBeenCalledWith('/api/clients/', {
      method: 'GET',
    })
    expect(rawApiClient.post).not.toHaveBeenCalled()
  })

  it('refreshes tokens and retries a protected request once after 401', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'refresh-token',
    })
    const protectedApiClient = {
      request: vi.fn()
        .mockRejectedValueOnce(new BackendApiError('Authentication required.', { status: 401 }))
        .mockResolvedValueOnce({ ok: true }),
    }
    const rawApiClient = {
      post: vi.fn(() => Promise.resolve({
        access: 'new-access',
        refresh: 'new-refresh',
      })),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      tokenStorage,
    })

    await expect(client.get('/api/auth/me/')).resolves.toEqual({ ok: true })

    expect(rawApiClient.post).toHaveBeenCalledWith('/api/auth/refresh/', {
      refresh: 'refresh-token',
    }, { skipAuth: true })
    expect(tokenStorage.write).toHaveBeenCalledWith({
      access: 'new-access',
      refresh: 'new-refresh',
    })
    expect(protectedApiClient.request).toHaveBeenCalledTimes(2)
  })

  it('clears tokens and reports session expiry when refresh token is missing', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: '',
    })
    const onSessionExpired = vi.fn()
    const protectedApiClient = {
      request: vi.fn(() => Promise.reject(new BackendApiError('Authentication required.', {
        status: 401,
      }))),
    }
    const rawApiClient = {
      post: vi.fn(),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      onSessionExpired,
      tokenStorage,
    })

    await expect(client.get('/api/clients/')).rejects.toMatchObject({
      code: 'session_expired',
      status: 401,
    })

    expect(rawApiClient.post).not.toHaveBeenCalled()
    expect(tokenStorage.clear).toHaveBeenCalled()
    expect(onSessionExpired).toHaveBeenCalledWith(expect.objectContaining({
      code: 'session_expired',
      status: 401,
    }))
  })

  it('clears tokens and reports session expiry when refresh fails', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'expired-refresh',
    })
    const onSessionExpired = vi.fn()
    const protectedApiClient = {
      request: vi.fn(() => Promise.reject(new BackendApiError('Authentication required.', {
        status: 401,
      }))),
    }
    const rawApiClient = {
      post: vi.fn(() => Promise.reject(new BackendApiError('Refresh failed.', {
        status: 401,
      }))),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      onSessionExpired,
      tokenStorage,
    })

    await expect(client.get('/api/clients/')).rejects.toMatchObject({
      code: 'session_expired',
      status: 401,
    })

    expect(rawApiClient.post).toHaveBeenCalledWith('/api/auth/refresh/', {
      refresh: 'expired-refresh',
    }, { skipAuth: true })
    expect(tokenStorage.clear).toHaveBeenCalled()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('does not refresh or expire the session after 403 responses', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'access-token',
      refresh: 'refresh-token',
    })
    const onSessionExpired = vi.fn()
    const protectedApiClient = {
      request: vi.fn(() => Promise.reject(new BackendApiError('Forbidden', {
        status: 403,
      }))),
    }
    const rawApiClient = {
      post: vi.fn(),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      onSessionExpired,
      tokenStorage,
    })

    await expect(client.get('/api/clients/')).rejects.toMatchObject({
      message: 'Forbidden',
      status: 403,
    })

    expect(rawApiClient.post).not.toHaveBeenCalled()
    expect(tokenStorage.clear).not.toHaveBeenCalled()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('does not refresh skipped-auth requests', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'refresh-token',
    })
    const onSessionExpired = vi.fn()
    const protectedApiClient = {
      request: vi.fn(() => Promise.reject(new BackendApiError('Authentication required.', {
        status: 401,
      }))),
    }
    const rawApiClient = {
      post: vi.fn(),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      onSessionExpired,
      tokenStorage,
    })

    await expect(client.get('/api/auth/me/', { skipAuth: true })).rejects.toThrow('Authentication required.')
    expect(rawApiClient.post).not.toHaveBeenCalled()
    expect(tokenStorage.clear).not.toHaveBeenCalled()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('shares an in-flight refresh across simultaneous protected 401 responses', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'refresh-token',
    })
    const protectedApiClient = {
      request: vi.fn()
        .mockRejectedValueOnce(new BackendApiError('Authentication required.', { status: 401 }))
        .mockRejectedValueOnce(new BackendApiError('Authentication required.', { status: 401 }))
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 }),
    }
    const rawApiClient = {
      post: vi.fn(() => Promise.resolve({
        access: 'new-access',
        refresh: 'new-refresh',
      })),
    }
    const client = createTokenAuthenticatedApiClient({
      baseApiClient: rawApiClient,
      createBaseApiClient: vi.fn(() => protectedApiClient),
      tokenStorage,
    })

    await expect(Promise.all([
      client.get('/api/clients/'),
      client.get('/api/workspaces/'),
    ])).resolves.toEqual([{ id: 1 }, { id: 2 }])

    expect(rawApiClient.post).toHaveBeenCalledTimes(1)
    expect(protectedApiClient.request).toHaveBeenCalledTimes(4)
  })
})
