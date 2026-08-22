import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DentalGrowthReviewDashboard } from './DentalGrowthReviewDashboard'

describe('DentalGrowthReviewDashboard', () => {
  it('keeps campaign navigation visible when campaign charts are not calculated', () => {
    const html = renderToStaticMarkup(
      <DentalGrowthReviewDashboard
        apiClient={{}}
        campaignSelector={<button type="button">Switch campaign</button>}
        page={{
          campaign: { name: 'Veneer Reactivation' },
          charts: {
            funnel: { available: false, stages: [] },
            reactivationActivity: { available: false },
          },
          layout: { items: [] },
          period: { end: '2026-08-31', start: '2026-08-01' },
          status: 'ready',
          weeklyReporting: {},
        }}
        refresh={null}
        viewer={{ agencyMemberships: [] }}
        workspaceId="workspace-1"
      />,
    )

    expect(html).toContain('Switch campaign')
    expect(html).toContain('Aug 1 – Aug 31')
  })
})
