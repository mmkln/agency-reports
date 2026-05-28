import { describe, expect, it, vi } from 'vitest'

import {
  getGrowthReviewDashboardPageFromApi,
  resolveGrowthReviewDateRange,
} from './growthReviewApiReadService'

describe('resolveGrowthReviewDateRange', () => {
  it('defaults to the latest seven days', () => {
    expect(resolveGrowthReviewDateRange({
      now: new Date('2026-05-17T12:00:00.000Z'),
    })).toEqual({
      end: '2026-05-17',
      selectedKey: 'current_week',
      start: '2026-05-11',
    })
  })

  it('uses explicit start and end as a custom range', () => {
    expect(resolveGrowthReviewDateRange({
      end: '2026-05-20',
      start: '2026-05-01',
    })).toEqual({
      end: '2026-05-20',
      selectedKey: 'custom',
      start: '2026-05-01',
    })
  })
})

describe('getGrowthReviewDashboardPageFromApi', () => {
  it('loads the backend read model and returns the dashboard page shape', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        funnel: [],
        hero_metrics: [
          {
            id: 'bookings',
            status: 'green',
            title: 'Bookings',
            value: 12,
          },
        ],
        period: {
          end: '2026-05-17',
          start: '2026-05-11',
          type: 'weekly',
        },
        workspace: {
          name: 'Green Dental',
          slug: 'green-dental',
          type: 'clinic',
        },
      }),
    }

    const page = await getGrowthReviewDashboardPageFromApi({
      apiClient,
      now: new Date('2026-05-17T12:00:00.000Z'),
      routeParams: {},
      viewer: {},
      workspaceId: 'workspace-1',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/workspace-1/growth-review/', {
      query: {
        end: '2026-05-17',
        start: '2026-05-11',
      },
    })
    expect(page).toMatchObject({
      client: {
        id: 'workspace-1',
        name: 'Green Dental',
      },
      status: 'ready',
    })
    expect(page.period.content.hero_metrics[0]).toMatchObject({
      id: 'bookings',
      value: 12,
    })
  })
})
