import { describe, expect, it, vi } from 'vitest'

import {
  getWorkspaceTagCatalog,
  updateWorkspaceTagDescription,
} from './api'

describe('getWorkspaceTagCatalog', () => {
  it('loads the workspace-scoped tag catalog', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({ source_connections: [], tags: [] }),
    }

    await getWorkspaceTagCatalog(apiClient, 'workspace-1')

    expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/workspace-1/tag-catalog/')
  })

  it('updates a workspace tag description', async () => {
    const apiClient = {
      request: vi.fn().mockResolvedValue({
        tag: { description: 'Starts the reactivation sequence.', id: 'tag-1' },
      }),
    }

    await updateWorkspaceTagDescription(
      apiClient,
      'workspace-1',
      'tag-1',
      'Starts the reactivation sequence.',
    )

    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/tag-catalog/tag-1/',
      {
        body: { description: 'Starts the reactivation sequence.' },
        method: 'PATCH',
      },
    )
  })
})
