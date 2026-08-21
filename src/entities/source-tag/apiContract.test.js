import { describe, expect, it } from 'vitest'

import { normalizeSourceTagCatalog } from './apiContract'

describe('source tag catalog API contract', () => {
  it('normalizes tags, source connections, and review usage', () => {
    const result = normalizeSourceTagCatalog({
      source_connections: [{
        external_account_id: 'location-1',
        id: 'connection-1',
        provider: 'ghl',
      }],
      tags: [{
        external_id: 'tag-1',
        id: 'definition-1',
        name: 'Reactivation Sequence Started',
        source_connection: {
          external_account_id: 'location-1',
          id: 'connection-1',
          provider: 'ghl',
        },
        updated_at: '2026-08-21T10:00:00Z',
        usages: [{
          campaign_id: 'campaign-1',
          campaign_name: 'August Reactivation',
          campaign_status: 'active',
          signal_key: 'sequence_started',
          signal_label: 'Sequence Started',
          signal_id: 'signal-1',
        }],
      }],
    })

    expect(result.sourceConnections[0]).toEqual({
      externalAccountId: 'location-1',
      id: 'connection-1',
      provider: 'ghl',
    })
    expect(result.tags[0]).toMatchObject({
      externalId: 'tag-1',
      name: 'Reactivation Sequence Started',
      updatedAt: '2026-08-21T10:00:00Z',
    })
    expect(result.tags[0].usages[0]).toEqual({
      campaignId: 'campaign-1',
      campaignName: 'August Reactivation',
      campaignStatus: 'active',
      signalKey: 'sequence_started',
      signalLabel: 'Sequence Started',
      signalId: 'signal-1',
    })
  })
})
