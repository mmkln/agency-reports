import { describe, expect, it } from 'vitest'

import {
  hiddenIdsFromVisibility,
  lifecycleGroupsFromAssignments,
  normalizeAnalyticsDashboardSettings,
  stageAssignmentsFromGroups,
} from './settingsModel'

describe('analytics dashboard settings model', () => {
  it('round-trips stage-centric assignments through the API grouping', () => {
    const groups = {
      active_nurture: ['stage-2'],
      booked: ['stage-1'],
      closed_out: [],
      long_term_nurture: ['stage-3'],
    }

    const assignments = stageAssignmentsFromGroups(groups)

    expect(assignments).toEqual({
      'stage-1': 'booked',
      'stage-2': 'active_nurture',
      'stage-3': 'long_term_nurture',
    })
    expect(lifecycleGroupsFromAssignments(assignments)).toEqual(groups)
  })

  it('normalizes source and visibility settings', () => {
    const settings = normalizeAnalyticsDashboardSettings({
      dashboard_key: 'weekly-lead-report',
      overview_metrics: [
        { is_visible: true, key: 'leads.created', label: 'Total leads' },
        { is_visible: false, key: 'appointments.showed', label: 'Showed' },
      ],
      sections: [{ id: 'activity', is_visible: false, label: 'Weekly Activity' }],
      sequence_active_tag_names: ['$199_oct2026_active'],
      source_mappings: [
        {
          detail: '$199 Campaign',
          key: 'meta',
          label: 'Meta Ads',
          priority: 10,
          tag_names: ['$199_fb_ads_campaign_oct2026'],
        },
      ],
      tag_options: [
        { label: '$199_oct2026_active', value: '$199_oct2026_active' },
      ],
      source_connection: {
        external_account_id: 'location-1',
        id: 'connection-1',
        provider: 'ghl',
        status: 'active',
      },
    })

    expect(settings.sourceConnection.externalAccountId).toBe('location-1')
    expect(settings.sequenceActiveTagNames).toEqual(['$199_oct2026_active'])
    expect(settings.sourceMappings).toEqual([
      {
        detail: '$199 Campaign',
        key: 'meta',
        label: 'Meta Ads',
        priority: 10,
        tagNames: ['$199_fb_ads_campaign_oct2026'],
      },
    ])
    expect(settings.tagOptions).toEqual([
      { label: '$199_oct2026_active', value: '$199_oct2026_active' },
    ])
    expect(hiddenIdsFromVisibility(settings.overviewMetrics)).toEqual(['appointments.showed'])
    expect(hiddenIdsFromVisibility(settings.sections)).toEqual(['activity'])
  })

  it('falls back to the legacy sequence tag options field', () => {
    const settings = normalizeAnalyticsDashboardSettings({
      sequence_tag_options: [{ label: 'legacy', value: 'legacy' }],
    })

    expect(settings.tagOptions).toEqual([{ label: 'legacy', value: 'legacy' }])
  })
})
