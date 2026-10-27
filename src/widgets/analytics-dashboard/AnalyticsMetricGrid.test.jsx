import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsMetricGrid } from './AnalyticsMetricGrid'

describe('AnalyticsMetricGrid', () => {
  it('renders configured presentation and metric-specific supporting context', () => {
    const html = renderToStaticMarkup(
      <AnalyticsMetricGrid
        metrics={[
          {
            comparison: { delta: 4, label: 'vs previous period' },
            key: 'leads.created',
            label: 'New leads',
            presentation: { icon_name: 'users', tone: 'positive' },
            unit: 'count',
            value: 42,
          },
          {
            comparison: { delta: -3, label: 'vs previous period' },
            key: 'appointments.booked',
            label: 'Appointments booked',
            presentation: {
              icon_name: 'calendar',
              label: 'Booked appointments',
              tone: 'positive',
              value_tone: 'neutral',
            },
            supporting: { denominator: 42, kind: 'percentage', label: 'of leads', numerator: 12 },
            unit: 'count',
            value: 12,
          },
          {
            comparison: { delta: -23, label: 'vs previous period' },
            key: 'appointments.showed',
            label: 'Appointments showed',
            presentation: { icon_name: 'checkCircle2', label: 'Showed', tone: 'info', value_tone: 'neutral' },
            supporting: { denominator: 126, kind: 'percentage', label: 'of booked', numerator: 97 },
            unit: 'count',
            value: 97,
          },
          {
            comparison: { delta: -0.1, label: 'vs previous period' },
            key: 'leads.to_booking_rate',
            label: 'Lead to booking',
            presentation: { icon_name: 'trendingUp', tone: 'accent' },
            supporting: { denominator: 17, kind: 'fraction', label: 'leads booked', numerator: 4 },
            unit: 'percent',
            value: 23.5,
          },
          {
            key: 'leads.in_sequence',
            label: 'In Sequence',
            presentation: { icon_name: 'messageSquare', tone: 'info', value_tone: 'neutral' },
            supporting: { kind: 'text', label: 'currently active across configured sequences' },
            unit: 'count',
            value: 14,
          },
          {
            comparison: { delta: 2, label: 'vs previous period' },
            key: 'leads.active_nurture',
            label: 'Active nurture',
            presentation: { icon_name: 'messageSquare', tone: 'info' },
            supporting: { kind: 'text', label: 'sequences, call queue, STN' },
            unit: 'count',
            value: 11,
          },
        ]}
      />,
    )

    expect(html).toContain('New leads')
    expect(html).toContain('Booked appointments')
    expect(html).toContain('29% of leads')
    expect(html).toContain('Showed')
    expect(html).toContain('77% of booked')
    expect(html).toContain('4 of 17 leads booked')
    expect(html).toContain('In Sequence')
    expect(html).toContain('currently active across configured sequences')
    expect(html).toContain('sequences, call queue, STN')
    expect(html).toContain('bg-success-muted')
    expect(html).toContain('bg-premium-blue/10')
    expect(html.match(/<svg/g)).toHaveLength(6)
  })

  it('renders a contact collection action from the backend descriptor', () => {
    const html = renderToStaticMarkup(
      <AnalyticsMetricGrid
        metrics={[{
          drilldown: {
            endpoint: '/api/workspaces/workspace-1/analytics/drilldown/',
            key: 'leads.created',
            label: 'View leads',
            title: 'Total leads',
            type: 'contact_collection',
          },
          key: 'leads.created',
          label: 'Total leads',
          unit: 'count',
          value: 17,
        }]}
        period={{ end: '2026-10-25', start: '2026-10-19', timezone: 'UTC' }}
        runtime={{ apiClient: {} }}
      />,
    )

    expect(html).toContain('aria-label="View leads"')
    expect(html).toContain('class="ml-auto"')
  })

  it('renders a dashboard-managed explanation for a hero metric', () => {
    const html = renderToStaticMarkup(
      <AnalyticsMetricGrid
        explanations={{
          'leads.created': {
            calculationExplanation: 'Count the lead cohort once.',
            definition: 'Leads created in the reporting period.',
            explanationKey: 'leads.created',
            kind: 'metric',
            label: 'Total leads',
            source: 'GHL opportunities',
          },
        }}
        metrics={[{
          key: 'leads.created',
          label: 'Total leads',
          unit: 'count',
          value: 17,
        }]}
      />,
    )

    expect(html).toContain('aria-label="About Total leads"')
  })
})
