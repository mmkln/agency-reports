import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { WorkspaceTagCatalog } from './WorkspaceTagCatalog'

const workflow = {
  filteredTags: [{
    externalId: 'tag-1',
    id: 'definition-1',
    name: 'Reactivation Sequence Started',
    sourceConnection: {
      externalAccountId: 'location-1',
      id: 'connection-1',
      provider: 'ghl',
    },
    updatedAt: '2026-08-21T10:00:00Z',
    usages: [{
      campaignId: 'campaign-1',
      campaignName: 'August Reactivation',
      signalId: 'signal-1',
      signalKey: 'sequence_started',
      signalLabel: 'Sequence Started',
    }],
  }],
  hasSourceConnections: true,
  query: '',
  refreshStatus: 'idle',
  refreshTags: vi.fn(),
  resource: { reload: vi.fn(), status: 'ready' },
  setQuery: vi.fn(),
  tagCount: 1,
}

vi.mock('./useWorkspaceTagCatalog', () => ({
  useWorkspaceTagCatalog: () => workflow,
}))

describe('WorkspaceTagCatalog', () => {
  it('renders searchable tags with review usage and source context', () => {
    const html = renderToStaticMarkup(
      <WorkspaceTagCatalog apiClient={{}} workspaceId="workspace-1" />,
    )

    expect(html).toContain('Search tags')
    expect(html).toContain('Reactivation Sequence Started')
    expect(html).toContain('August Reactivation · Sequence Started')
    expect(html).toContain('GHL · location-1')
    expect(html).toContain('Refresh tags from GHL')
  })
})
