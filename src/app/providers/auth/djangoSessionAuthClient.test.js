import { describe, expect, it, vi } from 'vitest'

import {
  createDjangoSessionAuthClient,
  mapDjangoUserToViewer,
} from './djangoSessionAuthClient'
import { AuthApiError } from './authApiClient'
import { WORKSPACE_CAPABILITIES } from '../../../entities/workspace-membership'

describe('mapDjangoUserToViewer', () => {
  it('maps Django /me response to the frontend viewer shape', () => {
    const viewer = mapDjangoUserToViewer({
      email: 'admin@example.com',
      id: '1',
      username: 'admin',
      workspaces: [
        {
          id: 'workspace-1',
          capabilities: [
            WORKSPACE_CAPABILITIES.VIEW_PORTAL,
            WORKSPACE_CAPABILITIES.MANAGE_INTEGRATIONS,
            'dental_growth_review_view',
          ],
          name: 'Dental Growth Review',
          role: 'owner',
          slug: 'dental-growth-review',
        },
      ],
    })

    expect(viewer).toMatchObject({
      activeWorkspaceId: 'workspace-1',
      authSource: 'django-session',
      email: 'admin@example.com',
      userId: '1',
      workspaceMemberships: [
        expect.objectContaining({
          role: 'clinic_owner',
          workspaceId: 'workspace-1',
        }),
      ],
    })
    expect(viewer.capabilities).toContain('dental_growth_review_view')
    expect(viewer.capabilities).toContain(WORKSPACE_CAPABILITIES.MANAGE_INTEGRATIONS)
    expect(viewer.workspaceMemberships[0].capabilities).toEqual([
      WORKSPACE_CAPABILITIES.VIEW_PORTAL,
      WORKSPACE_CAPABILITIES.MANAGE_INTEGRATIONS,
      'dental_growth_review_view',
    ])
  })

  it('falls back to role default capabilities when Django does not return explicit capabilities', () => {
    const viewer = mapDjangoUserToViewer({
      email: 'admin@example.com',
      id: '1',
      username: 'admin',
      workspaces: [
        {
          id: 'workspace-1',
          name: 'Dental Growth Review',
          role: 'owner',
          slug: 'dental-growth-review',
        },
      ],
    })

    expect(viewer.capabilities).toContain(WORKSPACE_CAPABILITIES.MANAGE_INTEGRATIONS)
    expect(viewer.capabilities).toContain('dental_growth_review_view')
  })
})

describe('createDjangoSessionAuthClient', () => {
  it('returns null viewer when /me returns 401', async () => {
    const apiClient = {
      get: vi.fn().mockRejectedValue(new AuthApiError('Unauthorized', { status: 401 })),
    }
    const authClient = createDjangoSessionAuthClient({ apiClient })

    await expect(authClient.getCurrentViewer()).resolves.toBeNull()
  })

  it('fetches csrf before login', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({ ok: true }),
      post: vi.fn().mockResolvedValue({
        user: {
          email: 'admin@example.com',
          id: '1',
          username: 'admin',
          workspaces: [],
        },
      }),
    }
    const authClient = createDjangoSessionAuthClient({ apiClient })

    await authClient.signInWithEmail({
      email: 'admin',
      password: 'secret',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/api/auth/csrf/')
    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login/', {
      password: 'secret',
      username: 'admin',
    })
  })
})
