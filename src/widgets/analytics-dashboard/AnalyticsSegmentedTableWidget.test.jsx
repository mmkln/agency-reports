import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsSegmentedTableWidget } from './AnalyticsSegmentedTableWidget'

describe('AnalyticsSegmentedTableWidget', () => {
  it('renders series, segmented values, totals, and reconciliation note', () => {
    const html = renderToStaticMarkup(
      <AnalyticsSegmentedTableWidget
        data={{
          key: 'bookings.by_channel',
          dimension_label: 'Channel',
          note: 'Lifecycle statuses reconcile to total leads.',
          rows: [
            {
              key: 'meta',
              label: 'Meta Ads',
              percentage: 75,
              total: 3,
              values: { scheduled: 1, showed: 2 },
            },
            {
              key: 'google',
              label: 'Google Ads',
              percentage: 25,
              total: 1,
              values: { scheduled: 0, showed: 1 },
            },
          ],
          series: [
            { key: 'showed', label: 'Showed', tone: 'positive' },
            { key: 'scheduled', label: 'Scheduled', tone: 'info' },
          ],
          total: 4,
          totals: { scheduled: 1, showed: 3 },
        }}
        explanations={{
          'bookings.by_channel': {
            definition: 'Bookings grouped by channel.',
            explanationKey: 'bookings.by_channel',
            kind: 'chart',
            label: 'Bookings by Channel',
          },
          'bookings.by_channel.percentage': {
            definition: 'Share of all bookings.',
            explanationKey: 'bookings.by_channel.percentage',
            kind: 'metric',
            label: '% of total',
          },
          'bookings.by_channel.scheduled': {
            definition: 'Appointments that remain scheduled.',
            explanationKey: 'bookings.by_channel.scheduled',
            kind: 'metric',
            label: 'Scheduled',
          },
          'bookings.by_channel.showed': {
            definition: 'Appointments with an attended outcome.',
            explanationKey: 'bookings.by_channel.showed',
            kind: 'metric',
            label: 'Showed',
          },
          'bookings.by_channel.total': {
            definition: 'All recognized bookings.',
            explanationKey: 'bookings.by_channel.total',
            kind: 'metric',
            label: 'Total bookings',
          },
        }}
        title="Bookings by Channel"
      />,
    )

    expect(html).toContain('Bookings by Channel')
    expect(html).toContain('Channel')
    expect(html).toContain('Showed')
    expect(html).toContain('Scheduled')
    expect(html).toContain('Meta Ads')
    expect(html).toContain('Google Ads')
    expect(html).toContain('75%')
    expect(html).toContain('Lifecycle statuses reconcile to total leads.')
    expect(html).toContain('rounded-block border border-separator')
    expect(html).toContain('width:66.66666666666666%')
    expect(html).toContain('width:33.33333333333333%')
    expect(html).toContain('overflow-hidden rounded-full')
    expect(html).toContain('aria-label="About Bookings by Channel"')
    expect(html).toContain('aria-label="About Showed"')
    expect(html).toContain('aria-label="About Scheduled"')
    expect(html).toContain('aria-label="About Total bookings"')
    expect(html).toContain('aria-label="About % of total"')
  })
})
