import { describe, expect, it, vi } from 'vitest'

import { getWorkspaceTagCatalog } from './api'

describe('getWorkspaceTagCatalog', () => {
  it('loads the workspace-scoped tag catalog', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({ source_connections: [], tags: [] }),
    }

    await getWorkspaceTagCatalog(apiClient, 'workspace-1')

    expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/workspace-1/tag-catalog/')
  })
})
