import { describe, expect, it } from 'vitest'

import {
  normalizeGrowthReviewReviewOptionsPayload,
  normalizeGrowthReviewReviewValidationIssues,
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
          configured_count: 7,
          is_complete: false,
          missing_keys: ['sms_reply_channel', 'email_reply_channel'],
          required_count: 9,
          touch_source_configured: true,
        },
        external_campaign_key: 'reactivation_august_2026',
        touch_campaign_key: 'reactivation_august_2026_touches',
        id: 'review-1',
        is_default: true,
        name: 'August review',
        pipeline_id: 'pipeline-1',
        signals: [{
          entity: 'opportunity',
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
        tracks: [{
          id: 'track-a',
          key: 'A',
          label: 'Track A',
          priority: 100,
          touch_track_value: 'a',
          signals: [{
            entity: 'any',
            expected_values: ['reactivation_august_track_a'],
            source: 'tag',
          }],
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
        configuredCount: 7,
        isComplete: false,
        missingKeys: ['sms_reply_channel', 'email_reply_channel'],
        requiredCount: 9,
        touchSourceConfigured: true,
      },
      externalCampaignKey: 'reactivation_august_2026',
      isDefault: true,
      pipelineId: 'pipeline-1',
      sourceConnectionId: 'source-1',
      touchCampaignKey: 'reactivation_august_2026_touches',
    })
    expect(result.reviews[0].signals[0]).toMatchObject({
      expectedValues: ['reactivation_august_2026'],
      entity: 'contact',
      isActive: true,
      label: 'Campaign cohort',
      source: 'tag',
    })
    expect(result.reviews[0].tracks[0]).toMatchObject({
      key: 'A',
      label: 'Track A',
      touchTrackValue: 'a',
      signals: [{ entity: 'contact', expectedValues: ['reactivation_august_track_a'] }],
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
        reactivation_touch_track_options: [{
          label: 'A',
          source_connection_id: 'source-1',
          value: 'a',
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
    expect(result.touchTrackOptions).toEqual([{
      label: 'A',
      sourceConnectionId: 'source-1',
      value: 'a',
    }])
  })

  it('serializes the editable review contract', () => {
    expect(toGrowthReviewReviewInput({
      activityStartDate: '2026-08-01',
      externalCampaignKey: ' reactivation_august_2026 ',
      isDefault: true,
      name: ' August review ',
      pipelineId: 'pipeline-1',
      signals: [{
        entity: 'opportunity',
        expectedValues: ['reactivation_august_2026'],
        key: 'imported_candidate',
        label: 'Campaign cohort',
        priority: 100,
        source: 'tag',
      }],
      tracks: [{
        key: 'A',
        label: 'Track A',
        priority: 100,
        touchTrackValue: 'a',
        signals: [{
          entity: 'any',
          expectedValues: ['reactivation_august_track_a'],
          source: 'tag',
        }],
      }],
      sourceConnectionId: 'source-1',
      status: 'active',
      touchCampaignKey: ' reactivation_august_2026_touches ',
    })).toEqual({
      activity_start_date: '2026-08-01',
      external_campaign_key: 'reactivation_august_2026',
      is_default: true,
      name: 'August review',
      pipeline_id: 'pipeline-1',
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
      tracks: [{
        is_active: true,
        key: 'A',
        label: 'Track A',
        priority: 100,
        touch_track_value: 'a',
        signals: [{
          entity: 'contact',
          expected_values: ['reactivation_august_track_a'],
          field_id: '',
          field_key: '',
          is_active: true,
          priority: 0,
          source: 'tag',
        }],
      }],
      source_connection_id: 'source-1',
      status: 'active',
      touch_campaign_key: 'reactivation_august_2026_touches',
    })
  })

  it('normalizes structured validation issues without flattening field paths', () => {
    expect(normalizeGrowthReviewReviewValidationIssues({
      issues: [{
        code: 'tag_not_found',
        message: 'This GHL tag is no longer available.',
        meta: { missing_values: ['missing-tag'] },
        path: 'tracks.1.signals.0.expected_values',
      }],
    })).toEqual([{
      code: 'tag_not_found',
      message: 'This GHL tag is no longer available.',
      meta: { missing_values: ['missing-tag'] },
      path: 'tracks.1.signals.0.expected_values',
    }])
  })
})
