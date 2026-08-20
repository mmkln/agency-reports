import { describe, expect, it } from 'vitest'

import {
  normalizeGrowthReviewReviewOptionsPayload,
  normalizeGrowthReviewReviewsPayload,
  toGrowthReviewReviewInput,
} from './apiContract'

describe('growth review review API contract', () => {
  it('normalizes review collection and signal fields', () => {
    const result = normalizeGrowthReviewReviewsPayload({
      default_review_id: 'review-1',
      reviews: [{
        activity_start_date: '2026-08-01',
        campaign_key: 'reactivation_august_2026',
        id: 'review-1',
        is_default: true,
        name: 'August review',
        pipeline_id: 'pipeline-1',
        signals: [{
          expected_values: ['reactivation_august_2026'],
          id: 'signal-1',
          is_active: true,
          key: 'imported_candidate',
          label: 'Campaign cohort',
        }],
        source_connection_id: 'source-1',
        status: 'active',
        workspace_id: 'workspace-1',
      }],
    })

    expect(result.defaultReviewId).toBe('review-1')
    expect(result.reviews[0]).toMatchObject({
      activityStartDate: '2026-08-01',
      campaignKey: 'reactivation_august_2026',
      isDefault: true,
      pipelineId: 'pipeline-1',
      sourceConnectionId: 'source-1',
    })
    expect(result.reviews[0].signals[0]).toMatchObject({
      expectedValues: ['reactivation_august_2026'],
      isActive: true,
      label: 'Campaign cohort',
    })
  })

  it('normalizes finite options from the backend', () => {
    const result = normalizeGrowthReviewReviewOptionsPayload({
      options: {
        pipelines: [{
          external_id: 'ghl-pipeline',
          id: 'pipeline-1',
          name: 'Reactivation',
          source_connection_id: 'source-1',
          stages: [],
        }],
        source_connections: [{
          external_account_id: 'ghl-location',
          id: 'source-1',
          provider: 'ghl',
          status: 'active',
        }],
        statuses: [{ label: 'Active', value: 'active' }],
      },
    })

    expect(result.sourceConnections[0].externalAccountId).toBe('ghl-location')
    expect(result.pipelines[0].sourceConnectionId).toBe('source-1')
    expect(result.statuses).toEqual([{ label: 'Active', value: 'active' }])
  })

  it('serializes the editable review contract', () => {
    expect(toGrowthReviewReviewInput({
      activityStartDate: '2026-08-01',
      campaignKey: ' reactivation_august_2026 ',
      isDefault: true,
      name: ' August review ',
      pipelineId: 'pipeline-1',
      sourceConnectionId: 'source-1',
      status: 'active',
    })).toEqual({
      activity_start_date: '2026-08-01',
      campaign_key: 'reactivation_august_2026',
      is_default: true,
      name: 'August review',
      pipeline_id: 'pipeline-1',
      source_connection_id: 'source-1',
      status: 'active',
    })
  })
})
