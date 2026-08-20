import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { GrowthReviewReviewManagement } from './GrowthReviewReviewManagement'

const selectedReview = {
  activityStartDate: '2026-05-26',
  campaignKey: 'reactivation_may_2026',
  id: 'review-1',
  isDefault: true,
  name: 'Reactivation Campaign May 2026',
  pipelineId: 'pipeline-1',
  signals: [{
    expectedValues: ['treatment accepted'],
    id: 'signal-1',
    isActive: true,
    key: 'treatment_accepted',
    label: 'Treatment accepted',
  }],
  sourceConnectionId: 'connection-1',
  status: 'active',
}

const workflow = {
  changeCreateField: vi.fn(),
  changeCreateSource: vi.fn(),
  changeReviewField: vi.fn(),
  changeReviewSource: vi.fn(),
  closeCreateDialog: vi.fn(),
  confirmArchive: vi.fn(),
  createDraft: {
    activityStartDate: '',
    campaignKey: '',
    isDefault: false,
    name: '',
    pipelineId: 'pipeline-1',
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
    pipelines: [],
    sourceConnections: [{ externalAccountId: 'location-1', id: 'connection-1' }],
    statuses: [
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
  },
  pipelinesForCreateSource: [{ id: 'pipeline-1', name: 'Reactivation' }],
  pipelinesForReviewSource: [{ id: 'pipeline-1', name: 'Reactivation' }],
  pipelineSyncState: 'idle',
  requestArchive: vi.fn(),
  refreshPipelines: vi.fn(),
  resetReviewDraft: vi.fn(),
  resource: { reload: vi.fn(), status: 'ready' },
  reviewDraft: {
    activityStartDate: '2026-05-26',
    campaignKey: 'reactivation_may_2026',
    isDefault: true,
    name: 'Reactivation Campaign May 2026',
    pipelineId: 'pipeline-1',
    sourceConnectionId: 'connection-1',
    status: 'active',
  },
  reviewPendingArchive: null,
  reviews: [selectedReview],
  saveReview: vi.fn(),
  selectReview: vi.fn(),
  selectedReview,
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
