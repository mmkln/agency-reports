import { describe, expect, it, vi } from 'vitest'

import { AuthApiError } from './authApiClient'
import { createBackendAuthClient } from './backendAuthClient'

function createViewerContext() {
  return {
    agency_memberships: [],
    managed_workspace_relationships: [],
    user: {
      email: 'owner@example.com',
      id: 'user_1',
      name: 'Owner',
    },
    workspace_memberships: [],
  }
}

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
        tokenType: nextTokens.token_type ?? nextTokens.tokenType ?? 'Bearer',
      }
      return tokens
    }),
  }
}

describe('createBackendAuthClient', () => {
  it('stores login tokens and returns the mapped viewer from the login response', async () => {
    const tokenStorage = createMemoryTokenStorage()
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({
        tokens: {
          access: 'access-token',
          refresh: 'refresh-token',
          token_type: 'Bearer',
        },
        viewer: createViewerContext(),
      })),
    }
    const authClient = createBackendAuthClient({ apiClient, tokenStorage })

    const viewer = await authClient.signInWithUsername({
      password: 'secret',
      username: 'owner',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login/', {
      password: 'secret',
      username: 'owner',
    }, { skipAuth: true })
    expect(tokenStorage.write).toHaveBeenCalledWith({
      access: 'access-token',
      refresh: 'refresh-token',
      token_type: 'Bearer',
    })
    expect(viewer).toEqual(expect.objectContaining({
      authSource: 'backend-token',
      email: 'owner@example.com',
      userId: 'user_1',
    }))
  })

  it('returns null without calling /me when no access token is stored', async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(),
    }
    const authClient = createBackendAuthClient({
      apiClient,
      tokenStorage: createMemoryTokenStorage(),
    })

    await expect(authClient.getCurrentViewer()).resolves.toBeNull()
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('clears tokens when /me rejects the stored token', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'expired-access',
      refresh: 'refresh-token',
      tokenType: 'Bearer',
    })
    const apiClient = {
      get: vi.fn(() => Promise.reject(new AuthApiError('Authentication required.', {
        status: 401,
      }))),
      post: vi.fn(),
    }
    const authClient = createBackendAuthClient({ apiClient, tokenStorage })

    await expect(authClient.getCurrentViewer()).resolves.toBeNull()
    expect(tokenStorage.clear).toHaveBeenCalled()
  })

  it('sends the refresh token on sign out and clears local tokens', async () => {
    const tokenStorage = createMemoryTokenStorage({
      access: 'access-token',
      refresh: 'refresh-token',
      tokenType: 'Bearer',
    })
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({ ok: true })),
    }
    const authClient = createBackendAuthClient({ apiClient, tokenStorage })

    await authClient.signOut()

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/logout/', {
      refresh: 'refresh-token',
    }, { skipAuth: true })
    expect(tokenStorage.clear).toHaveBeenCalled()
  })
})
