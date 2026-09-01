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

  it('renders explanation triggers for summary metrics', () => {
    const html = renderToStaticMarkup(
      <DentalGrowthReviewDashboard
        apiClient={{}}
        campaignId="campaign-1"
        page={{
          campaign: { name: 'Veneer Reactivation' },
          charts: {
            funnel: {
              available: true,
              stages: [
                { id: 'imported_candidate', stage_count: 100 },
                { id: 'replied_positive', stage_count: 20 },
                { id: 'booked', stage_count: 5 },
              ],
            },
            reactivationActivity: {
              available: true,
              cards: [
                { key: 'actual_bookings', value: 5 },
                { key: 'booked_expected_value', value: 12000 },
              ],
              series: [],
            },
          },
          dashboardExplanations: {
            'summary.booked_appointments': {
              definition: 'Booked patients.',
              explanationKey: 'summary.booked_appointments',
              kind: 'metric',
              label: 'Booked appointments',
            },
            'summary.patient_replies': {
              definition: 'Patients who replied.',
              explanationKey: 'summary.patient_replies',
              kind: 'metric',
              label: 'Patient replies',
            },
          },
          layout: { items: [] },
          permissions: { canEditDashboardExplanations: false },
          period: { end: '2026-08-31', start: '2026-08-01' },
          status: 'ready',
          weeklyReporting: {},
        }}
        refresh={null}
        workspaceId="workspace-1"
      />,
    )

    expect(html).toContain('aria-label="About Booked appointments"')
    expect(html).toContain('aria-label="About Patient replies"')
  })
})
