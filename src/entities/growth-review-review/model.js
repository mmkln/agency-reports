export const GROWTH_REVIEW_REVIEW_STATUS_META = Object.freeze({
  active: { label: 'Active', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
  completed: { label: 'Completed', tone: 'info' },
})

export function getGrowthReviewReviewStatusMeta(status) {
  return GROWTH_REVIEW_REVIEW_STATUS_META[status]
    ?? { label: status || 'Unknown', tone: 'neutral' }
}
