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
        allowed_statuses: ['active', 'completed', 'archived'],
        configuration: {
          configured_count: 6,
          is_complete: false,
          missing_keys: ['sms_reply_channel', 'email_reply_channel'],
          required_count: 8,
        },
        external_campaign_key: 'reactivation_august_2026',
        id: 'review-1',
        is_default: true,
        name: 'August review',
        pipeline_id: 'pipeline-1',
        sequence_active_stage_id: 'stage-1',
        signals: [{
          entity: 'contact',
          expected_values: ['reactivation_august_2026'],
          field_id: '',
          field_key: '',
          id: 'signal-1',
          is_active: true,
          key: 'imported_candidate',
          label: 'Campaign cohort',
          priority: 100,
          source: 'tag',
        }],
        source_connection_id: 'source-1',
        status: 'active',
        workspace_id: 'workspace-1',
      }],
    })

    expect(result.defaultReviewId).toBe('review-1')
    expect(result.reviews[0]).toMatchObject({
      activityStartDate: '2026-08-01',
      allowedStatuses: ['active', 'completed', 'archived'],
      configuration: {
        configuredCount: 6,
        isComplete: false,
        missingKeys: ['sms_reply_channel', 'email_reply_channel'],
        requiredCount: 8,
      },
      externalCampaignKey: 'reactivation_august_2026',
      isDefault: true,
      pipelineId: 'pipeline-1',
      sequenceActiveStageId: 'stage-1',
      sourceConnectionId: 'source-1',
    })
    expect(result.reviews[0].signals[0]).toMatchObject({
      expectedValues: ['reactivation_august_2026'],
      isActive: true,
      label: 'Campaign cohort',
      source: 'tag',
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
        signal_keys: [{ label: 'Campaign cohort', required: true, value: 'imported_candidate' }],
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
      externalCampaignKey: ' reactivation_august_2026 ',
      isDefault: true,
      name: ' August review ',
      pipelineId: 'pipeline-1',
      sequenceActiveStageId: 'stage-1',
      signals: [{
        entity: 'contact',
        expectedValues: ['reactivation_august_2026'],
        key: 'imported_candidate',
        label: 'Campaign cohort',
        priority: 100,
        source: 'tag',
      }],
      sourceConnectionId: 'source-1',
      status: 'active',
    })).toEqual({
      activity_start_date: '2026-08-01',
      external_campaign_key: 'reactivation_august_2026',
      is_default: true,
      name: 'August review',
      pipeline_id: 'pipeline-1',
      sequence_active_stage_id: 'stage-1',
      signals: [{
        confidence: 'medium',
        entity: 'contact',
        expected_values: ['reactivation_august_2026'],
        field_id: '',
        field_key: '',
        is_active: true,
        key: 'imported_candidate',
        label: 'Campaign cohort',
        priority: 100,
        source: 'tag',
      }],
      source_connection_id: 'source-1',
      status: 'active',
    })
  })
})
