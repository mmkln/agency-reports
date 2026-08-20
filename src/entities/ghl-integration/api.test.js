import { describe, expect, it, vi } from 'vitest'

import { syncGhlPipelines } from './api'

describe('syncGhlPipelines', () => {
  it('runs the workspace-scoped pipeline reference sync', async () => {
    const apiClient = {
      post: vi.fn().mockResolvedValue({ status: 'completed' }),
    }

    await syncGhlPipelines(apiClient, 'workspace-1', 'connection-1')

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/source-connections/connection-1/ghl/pipelines/sync/',
      {},
    )
  })
})
