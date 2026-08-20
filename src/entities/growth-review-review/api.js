import {
  normalizeGrowthReviewReview,
  normalizeGrowthReviewReviewOptionsPayload,
  normalizeGrowthReviewReviewsPayload,
  toGrowthReviewReviewInput,
} from './apiContract'

function reviewsPath(workspaceId) {
  return `/api/workspaces/${workspaceId}/growth-review/reviews/`
}

export function listGrowthReviewReviews(apiClient, workspaceId) {
  return apiClient.get(reviewsPath(workspaceId))
    .then(normalizeGrowthReviewReviewsPayload)
}

export function getGrowthReviewReviewOptions(apiClient, workspaceId) {
  return apiClient.get(`${reviewsPath(workspaceId)}options/`)
    .then(normalizeGrowthReviewReviewOptionsPayload)
}

export function createGrowthReviewReview(apiClient, workspaceId, draft) {
  return apiClient.post(reviewsPath(workspaceId), toGrowthReviewReviewInput(draft))
    .then((payload) => normalizeGrowthReviewReview(payload.review))
}

export function updateGrowthReviewReview(apiClient, workspaceId, reviewId, draft) {
  return apiClient.request(`${reviewsPath(workspaceId)}${reviewId}/`, {
    body: toGrowthReviewReviewInput(draft),
    method: 'PATCH',
  }).then((payload) => normalizeGrowthReviewReview(payload.review))
}

export function archiveGrowthReviewReview(apiClient, workspaceId, review) {
  return apiClient.request(`${reviewsPath(workspaceId)}${review.id}/`, {
    body: { status: 'archived' },
    method: 'PATCH',
  }).then((payload) => normalizeGrowthReviewReview(payload.review))
}
