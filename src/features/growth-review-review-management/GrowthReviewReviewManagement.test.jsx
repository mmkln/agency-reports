import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { GrowthReviewReviewManagement } from './GrowthReviewReviewManagement'

const selectedReview = {
  activityStartDate: '2026-05-26',
  allowedStatuses: ['active', 'completed', 'archived'],
  externalCampaignKey: 'reactivation_may_2026',
  id: 'review-1',
  isDefault: true,
  name: 'Reactivation Campaign May 2026',
  pipelineId: 'pipeline-1',
  signals: [{
    entity: 'contact',
    expectedValues: ['reactivation2_sequence_started'],
    id: 'signal-sequence-started',
    isActive: true,
    key: 'sequence_started',
    label: 'Sequence started',
    source: 'tag',
  }, {
    entity: 'opportunity',
    expectedValues: ['treatment accepted'],
    id: 'signal-1',
    isActive: true,
    key: 'treatment_accepted',
    label: 'Treatment accepted',
    source: 'tag',
  }, {
    entity: 'opportunity',
    expectedValues: [],
    fieldId: 'field-1',
    fieldKey: 'opportunity.treatment_accepted',
    id: 'signal-2',
    isActive: true,
    key: 'sms_reply_channel',
    label: 'SMS reply channel',
    source: 'custom_field',
  }],
  sourceConnectionId: 'connection-1',
  status: 'active',
}

const workflow = {
  addReviewSignal: vi.fn(),
  changeCreateField: vi.fn(),
  changeCreateSource: vi.fn(),
  changeReviewField: vi.fn(),
  changeReviewSignal: vi.fn(),
  changeReviewSource: vi.fn(),
  closeCreateDialog: vi.fn(),
  confirmArchive: vi.fn(),
  createDraft: {
    activityStartDate: '',
    externalCampaignKey: '',
    isDefault: false,
    name: '',
    pipelineId: 'pipeline-1',
    signals: [],
    sourceConnectionId: 'connection-1',
    status: 'active',
  },
  createReview: vi.fn(),
  fieldErrors: {},
  isCreateOpen: false,
  isDirty: false,
  openCreateDialog: vi.fn(),
  operationError: '',
  operationState: 'idle',
  options: {
    customFields: [{
      entity: 'opportunity',
      fieldKey: 'opportunity.treatment_accepted',
      id: 'field-1',
      label: 'Treatment accepted',
      sourceConnectionId: 'connection-1',
    }],
    pipelines: [],
    signalKeys: [
      { label: 'Sequence started', required: true, value: 'sequence_started' },
      { label: 'Treatment accepted', required: true, value: 'treatment_accepted' },
      { label: 'SMS reply channel', required: true, value: 'sms_reply_channel' },
    ],
    sourceConnections: [{ externalAccountId: 'location-1', id: 'connection-1' }],
    statuses: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
    tags: [{ label: 'Treatment accepted', sourceConnectionId: 'connection-1', value: 'treatment accepted' }],
  },
  pipelinesForCreateSource: [{ id: 'pipeline-1', name: 'Reactivation', stages: [] }],
  pipelinesForReviewSource: [{
    id: 'pipeline-1',
    name: 'Reactivation',
    stages: [],
  }],
  pipelineSyncState: 'idle',
  requestArchive: vi.fn(),
  removeReviewSignal: vi.fn(),
  refreshPipelines: vi.fn(),
  resetReviewDraft: vi.fn(),
  resource: { reload: vi.fn(), status: 'ready' },
  reviewDraft: {
    activityStartDate: '2026-05-26',
    externalCampaignKey: 'reactivation_may_2026',
    isDefault: true,
    name: 'Reactivation Campaign May 2026',
    pipelineId: 'pipeline-1',
    signals: selectedReview.signals,
    sourceConnectionId: 'connection-1',
    status: 'active',
  },
  reviewPendingArchive: null,
  reviews: [selectedReview],
  saveReview: vi.fn(),
  selectReview: vi.fn(),
  selectedReview,
  validateReview: vi.fn(),
  validationResult: null,
  validationState: 'idle',
}

vi.mock('./useGrowthReviewReviewsWorkflow', () => ({
  useGrowthReviewReviewsWorkflow: () => workflow,
}))

describe('GrowthReviewReviewManagement', () => {
  it('renders a configured campaign review', () => {
    const html = renderToStaticMarkup(
      <GrowthReviewReviewManagement apiClient={{}} workspaceId="workspace-1" />,
    )

    expect(html).toContain('Reactivation Campaign May 2026')
    expect(html).toContain('Active')
    expect(html).not.toContain('Campaign review</span>')
    expect(html).toContain('Treatment accepted')
    expect(html).toContain('Search tags')
    expect(html).toContain('Search custom fields')
    expect(html).toContain('2 of 3 configured')
    expect(html).toContain('Sequence started')
    expect(html).toContain('You can save partial progress')
    expect(html).toContain('aria-label="Remove Treatment accepted source"')
    expect(html).toContain('aria-label="Collapse outcome mapping"')
    expect(html).toContain('Refresh pipelines from GHL')
    expect(html).not.toContain('Campaign reviews</h2>')
  })

  it('keeps review creation inside the empty content state', () => {
    const previousReviews = workflow.reviews
    const previousSelectedReview = workflow.selectedReview
    workflow.reviews = []
    workflow.selectedReview = null

    try {
      const html = renderToStaticMarkup(
        <GrowthReviewReviewManagement apiClient={{}} workspaceId="workspace-1" />,
      )

      expect(html).toContain('No campaign reviews yet')
      expect(html).toContain('Add campaign review')
    } finally {
      workflow.reviews = previousReviews
      workflow.selectedReview = previousSelectedReview
    }
  })
})
