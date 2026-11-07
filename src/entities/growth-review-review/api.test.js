import { describe, expect, it, vi } from 'vitest'

import { updateGrowthReviewReviewName } from './api'

describe('growth review review api', () => {
  it('updates only the normalized review name', async () => {
    const request = vi.fn().mockResolvedValue({
      review: {
        id: 'review-1',
        name: 'Renamed review',
      },
    })

    const review = await updateGrowthReviewReviewName(
      { request },
      'workspace-1',
      'review-1',
      '  Renamed review  ',
    )

    expect(request).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/growth-review/reviews/review-1/',
      {
        body: { name: 'Renamed review' },
        method: 'PATCH',
      },
    )
    expect(review.name).toBe('Renamed review')
  })
})
