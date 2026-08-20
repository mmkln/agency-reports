import { describe, expect, it, vi } from 'vitest'

import { AuthApiError } from './authApiClient'
import { createBackendAuthClient, mapBackendViewerContextToViewer } from './backendAuthClient'

function createViewerContext() {
  return {
    agency_memberships: [],
    client_memberships: [],
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

    const viewer = await authClient.signInWithEmail({
      email: 'owner@example.com',
      password: 'secret',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login/', {
      email: 'owner@example.com',
      password: 'secret',
    }, { skipAuth: true })
    expect(tokenStorage.write).toHaveBeenCalledWith({
      access: 'access-token',
      refresh: 'refresh-token',
      token_type: 'Bearer',
    })
    expect(viewer).toEqual(expect.objectContaining({
      authSource: 'backend-token',
      clientMemberships: [],
      email: 'owner@example.com',
      userId: 'user_1',
    }))
  })

  it('requests password reset without auth', async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({
        detail: 'If an account exists for this email, reset instructions have been sent.',
        ok: true,
      })),
    }
    const authClient = createBackendAuthClient({
      apiClient,
      tokenStorage: createMemoryTokenStorage(),
    })

    await expect(authClient.requestPasswordReset({
      email: 'owner@example.com',
    })).resolves.toEqual(expect.objectContaining({ ok: true }))

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/password-reset/request/', {
      email: 'owner@example.com',
    }, { skipAuth: true })
  })

  it('requests an email login code without auth', async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({
        detail: 'If an account exists for this email, a sign-in code has been sent.',
        ok: true,
      })),
    }
    const authClient = createBackendAuthClient({
      apiClient,
      tokenStorage: createMemoryTokenStorage(),
    })

    await expect(authClient.requestEmailLoginCode({
      email: 'owner@example.com',
    })).resolves.toEqual(expect.objectContaining({ ok: true }))

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/email-code/request/', {
      email: 'owner@example.com',
    }, { skipAuth: true })
  })

  it('stores tokens and returns the mapped viewer after email code verification', async () => {
    const tokenStorage = createMemoryTokenStorage()
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({
        tokens: {
          access: 'code-access-token',
          refresh: 'code-refresh-token',
          token_type: 'Bearer',
        },
        viewer: createViewerContext(),
      })),
    }
    const authClient = createBackendAuthClient({ apiClient, tokenStorage })

    const viewer = await authClient.signInWithEmailCode({
      code: '123456',
      email: 'owner@example.com',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/email-code/verify/', {
      code: '123456',
      email: 'owner@example.com',
    }, { skipAuth: true })
    expect(tokenStorage.write).toHaveBeenCalledWith({
      access: 'code-access-token',
      refresh: 'code-refresh-token',
      token_type: 'Bearer',
    })
    expect(viewer).toEqual(expect.objectContaining({
      authSource: 'backend-token',
      email: 'owner@example.com',
      userId: 'user_1',
    }))
  })

  it('looks up a password reset token without auth', async () => {
    const apiClient = {
      get: vi.fn(() => Promise.resolve({
        reset: {
          email: 'o***@example.com',
          expires_at: '2026-08-19T10:30:00Z',
          status: 'pending',
        },
      })),
      post: vi.fn(),
    }
    const authClient = createBackendAuthClient({
      apiClient,
      tokenStorage: createMemoryTokenStorage(),
    })

    await expect(authClient.getPasswordReset('reset-token')).resolves.toEqual({
      reset: expect.objectContaining({
        status: 'pending',
      }),
    })

    expect(apiClient.get).toHaveBeenCalledWith('/api/auth/password-reset/reset-token/', {
      skipAuth: true,
    })
  })

  it('confirms password reset without auth', async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(() => Promise.resolve({ ok: true })),
    }
    const authClient = createBackendAuthClient({
      apiClient,
      tokenStorage: createMemoryTokenStorage(),
    })

    await expect(authClient.confirmPasswordReset({
      password: 'NewPass123!',
      passwordConfirm: 'NewPass123!',
      token: 'reset-token',
    })).resolves.toEqual({ ok: true })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/password-reset/reset-token/confirm/', {
      password: 'NewPass123!',
      password_confirm: 'NewPass123!',
    }, { skipAuth: true })
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

  it('maps client memberships from the backend viewer context', () => {
    const viewer = mapBackendViewerContextToViewer({
      ...createViewerContext(),
      client_memberships: [
        {
          agency_id: 'agency_1',
          agency_name: 'Alpine Marketing',
          client_id: 'client_1',
          client_name: 'Inspo Dental',
          id: 'membership_1',
          role: 'client_admin',
          status: 'active',
        },
      ],
    })

    expect(viewer).toEqual(expect.objectContaining({
      activeClientId: 'client_1',
      clientMemberships: [
        expect.objectContaining({
          agencyId: 'agency_1',
          clientId: 'client_1',
          clientName: 'Inspo Dental',
          role: 'client_admin',
        }),
      ],
    }))
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
