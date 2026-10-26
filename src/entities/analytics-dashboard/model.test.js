import { describe, expect, it } from 'vitest'

import { isAnalyticsRefreshFinished, normalizeAnalyticsDashboard } from './model'

describe('analytics dashboard contract', () => {
  it('normalizes a config-driven dashboard payload without metric-specific knowledge', () => {
    expect(normalizeAnalyticsDashboard({
      calculated_at: '2026-10-25T10:00:00Z',
      dashboard: { config_version: 1, key: 'weekly-lead-report', title: 'Weekly Lead Report' },
      period: { end: '2026-10-25', start: '2026-10-19', timezone: 'UTC', type: 'week' },
      snapshot_id: 'snapshot-1',
      status: 'completed',
      explanations: {
        'leads.created': {
          definition: 'Leads created in the selected period.',
          explanation_key: 'leads.created',
          label: 'Total leads',
        },
      },
      permissions: { can_edit_explanations: true },
      widgets: [{
        data: [{
          drilldown: {
            endpoint: '/api/workspaces/workspace-1/analytics/drilldown/',
            key: 'leads.created',
            label: 'View leads',
            title: 'Total leads',
            type: 'contact_collection',
          },
          key: 'leads.created',
          value: 12,
        }],
        id: 'overview',
        title: 'At a glance',
        type: 'metric_grid',
      }],
    })).toMatchObject({
      dashboard: { key: 'weekly-lead-report' },
      explanations: {
        'leads.created': { explanationKey: 'leads.created', label: 'Total leads' },
      },
      permissions: { canEditExplanations: true },
      snapshotId: 'snapshot-1',
      status: 'completed',
      widgets: [{
        data: [{
          drilldown: {
            endpoint: '/api/workspaces/workspace-1/analytics/drilldown/',
            key: 'leads.created',
            label: 'View leads',
            title: 'Total leads',
            type: 'contact_collection',
          },
        }],
        id: 'overview',
        type: 'metric_grid',
      }],
    })
  })

  it('rejects widget types that the client cannot render', () => {
    expect(() => normalizeAnalyticsDashboard({
      dashboard: { key: 'weekly-lead-report' },
      period: { end: '2026-10-25', start: '2026-10-19' },
      widgets: [{ id: 'unsafe', type: 'javascript' }],
    })).toThrow('unsupported widget')
  })

  it('recognizes terminal refresh states', () => {
    expect(isAnalyticsRefreshFinished({ status: 'running' })).toBe(false)
    expect(isAnalyticsRefreshFinished({ status: 'completed' })).toBe(true)
    expect(isAnalyticsRefreshFinished({ status: 'failed' })).toBe(true)
  })
})
