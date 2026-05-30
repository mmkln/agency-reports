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

  it('does not refresh skipped-auth requests', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'refresh-token',
    })
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
      tokenStorage,
    })

    await expect(client.get('/api/auth/me/', { skipAuth: true })).rejects.toThrow('Authentication required.')
    expect(rawApiClient.post).not.toHaveBeenCalled()
  })
})
