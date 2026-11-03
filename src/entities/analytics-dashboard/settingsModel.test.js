import { describe, expect, it } from 'vitest'

import {
  buildAnalyticsDashboardSettingsPatch,
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

  it('builds a display-only patch without resubmitting calculation settings', () => {
    const initial = normalizeAnalyticsDashboardSettings({
      lifecycle_stage_ids: { booked: ['stage-1'] },
      overview_metrics: [{ is_visible: true, key: 'leads.created', label: 'Total leads' }],
      pipeline_ids: ['pipeline-1'],
      sections: [{ id: 'activity', is_visible: true, label: 'Weekly Activity' }],
    })
    const current = {
      ...initial,
      sections: initial.sections.map((section) => ({ ...section, isVisible: false })),
    }

    expect(buildAnalyticsDashboardSettingsPatch(initial, current)).toEqual({
      display: {
        hidden_metric_keys: [],
        hidden_widget_ids: ['activity'],
      },
    })
  })

  it('builds a calculation patch independently from display settings', () => {
    const initial = normalizeAnalyticsDashboardSettings({
      lifecycle_stage_ids: { booked: ['stage-1'] },
      pipeline_ids: ['pipeline-1'],
      source_mappings: [{ key: 'meta', tag_names: ['meta-old'] }],
    })
    const current = {
      ...initial,
      sourceMappings: initial.sourceMappings.map((mapping) => ({
        ...mapping,
        tagNames: ['meta-new'],
      })),
    }

    const patch = buildAnalyticsDashboardSettingsPatch(initial, current)

    expect(patch.display).toBeUndefined()
    expect(patch.calculation.source_mappings).toEqual([
      { key: 'meta', tag_names: ['meta-new'] },
    ])
  })
})
