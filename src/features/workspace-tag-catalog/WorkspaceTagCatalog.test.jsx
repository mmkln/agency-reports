import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { WorkspaceTagCatalog } from './WorkspaceTagCatalog'
import { formatSourceTagSyncDate } from '@/entities/source-tag'

const workflow = {
  catalogUpdatedAt: '2026-08-21T10:00:00Z',
  filteredTags: [{
    description: 'Starts the configured reactivation sequence.',
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
    }, {
      campaignId: 'campaign-2',
      campaignName: 'September Reactivation',
      signalId: 'signal-2',
      signalKey: 'imported_candidate',
      signalLabel: 'Imported Candidate',
    }],
  }],
  hasSourceConnections: true,
  openDescriptionEditor: vi.fn(),
  query: '',
  refreshStatus: 'idle',
  refreshTags: vi.fn(),
  resource: { reload: vi.fn(), status: 'ready' },
  setQuery: vi.fn(),
  showSourceColumn: false,
  tagCount: 1,
}

vi.mock('./useWorkspaceTagCatalog', () => ({
  useWorkspaceTagCatalog: () => workflow,
}))

describe('WorkspaceTagCatalog', () => {
  it('keeps the catalog table focused on tag names and review usage', () => {
    const html = renderToStaticMarkup(
      <WorkspaceTagCatalog apiClient={{}} workspaceId="workspace-1" />,
    )

    expect(html).toContain('Search tags')
    expect(html).toContain('Reactivation Sequence Started')
    expect(html).toContain('Starts the configured reactivation sequence.')
    expect(html).toContain('Edit Reactivation Sequence Started description')
    expect(html).toContain('August Reactivation · Sequence Started')
    expect(html).toContain('+1 more')
    expect(html).toContain(`Updated ${formatSourceTagSyncDate(workflow.catalogUpdatedAt)}`)
    expect(html).toContain('Refresh tags from GHL')
    expect(html).not.toContain('View Reactivation Sequence Started details')
    expect(html).not.toContain('tag-1')
    expect(html).not.toContain('Last synced')
    expect(html).not.toContain('GHL · location-1')
  })

  it('shows source context when the workspace has multiple connections', () => {
    workflow.showSourceColumn = true

    const html = renderToStaticMarkup(
      <WorkspaceTagCatalog apiClient={{}} workspaceId="workspace-1" />,
    )

    expect(html).toContain('Source')
    expect(html).toContain('GHL · location-1')

    workflow.showSourceColumn = false
  })
})
