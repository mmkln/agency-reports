import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DentalGrowthReviewDashboard } from './DentalGrowthReviewDashboard'

describe('DentalGrowthReviewDashboard', () => {
  it('keeps campaign navigation visible when campaign charts are not calculated', () => {
    const html = renderToStaticMarkup(
      <DentalGrowthReviewDashboard
        apiClient={{}}
        campaignId="campaign-1"
        campaignSelector={<button type="button">Switch campaign</button>}
        page={{
          campaign: { name: 'Veneer Reactivation' },
          charts: {
            funnel: { available: false, stages: [] },
            reactivationActivity: { available: false },
          },
          layout: { items: [] },
          permissions: { canCustomizeLayout: false },
          period: { end: '2026-08-31', start: '2026-08-01' },
          status: 'ready',
          weeklyReporting: {},
        }}
        refresh={null}
        workspaceId="workspace-1"
      />,
    )

    expect(html).toContain('Switch campaign')
    expect(html).toContain('Aug 1 – Aug 31')
  })

  it('omits hidden widgets and their section navigation entries', () => {
    const html = renderToStaticMarkup(
      <DentalGrowthReviewDashboard
        apiClient={{}}
        campaignId="campaign-1"
        page={{
          campaign: { name: 'Veneer Reactivation' },
          charts: {
            funnel: { available: false, stages: [] },
            reactivationActivity: { available: false },
          },
          layout: {
            items: [
              {
                isVisible: false,
                label: 'Reactivation Activity',
                widgetKey: 'reactivation_activity',
              },
            ],
          },
          period: { end: '2026-08-31', start: '2026-08-01' },
          permissions: { canCustomizeLayout: true },
          status: 'ready',
          weeklyReporting: {},
        }}
        refresh={null}
        workspaceId="workspace-1"
      />,
    )

    expect(html).toContain('Customize')
    expect(html).not.toContain('growth-review-reactivation_activity')
    expect(html).not.toContain('>Activity<')
  })
})
