import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnalyticsBookingActivityWidget } from './AnalyticsBookingActivityWidget'

describe('AnalyticsBookingActivityWidget', () => {
  it('renders booking summary, non-zero channels, outcomes, and metric explanations', () => {
    const html = renderToStaticMarkup(
      <AnalyticsBookingActivityWidget
        data={{
          explanation_key: 'bookings.by_channel',
          drilldowns: {
            booked: {
              endpoint: '/api/workspaces/workspace-1/booked/',
              key: 'bookings.by_channel.booked',
              label: 'View booked appointments',
              title: 'Booked appointments',
              type: 'contact_collection',
            },
            showed: {
              endpoint: '/api/workspaces/workspace-1/showed/',
              key: 'bookings.by_channel.showed',
              label: 'View showed appointments',
              title: 'Showed appointments',
              type: 'contact_collection',
            },
            cancelled: {
              endpoint: '/api/workspaces/workspace-1/cancelled/',
              key: 'bookings.by_channel.cancelled',
              label: 'View cancelled appointments',
              title: 'Cancelled appointments',
              type: 'contact_collection',
            },
            upcoming: {
              endpoint: '/api/workspaces/workspace-1/upcoming/',
              key: 'bookings.by_channel.upcoming',
              label: 'View upcoming appointments',
              title: 'Upcoming appointments',
              type: 'contact_collection',
            },
          },
          key: 'bookings.by_channel',
          note: 'Bookings made during the selected period.',
          rows: [
            {
              booked: 5,
              key: 'meta',
              label: 'Meta Ads',
              tone: 'accent',
              values: { cancelled: 1, no_show: 0, pending: 0, showed: 3, upcoming: 1 },
            },
            {
              booked: 2,
              key: 'google_ads',
              label: 'Google Ads',
              tone: 'info',
              values: { cancelled: 0, no_show: 0, pending: 0, showed: 2, upcoming: 0 },
            },
          ],
          series: [
            { key: 'showed', label: 'Showed', tone: 'positive' },
            { key: 'cancelled', label: 'Cancelled', tone: 'neutral' },
            { key: 'upcoming', label: 'Upcoming', tone: 'info' },
            { key: 'pending', label: 'Pending outcome', tone: 'warning' },
          ],
          summary: {
            booked: 7,
            cancelled: 1,
            from_earlier_leads: 3,
            from_new_leads: 4,
            pending: 0,
            showed: 5,
            upcoming: 1,
          },
          total: 7,
          totals: { cancelled: 1, no_show: 0, pending: 0, showed: 5, upcoming: 1 },
        }}
        explanations={{
          'bookings.by_channel': {
            definition: 'Bookings grouped by channel.',
            explanationKey: 'bookings.by_channel',
            label: 'Bookings by Channel',
          },
          'bookings.by_channel.booked': {
            definition: 'Appointments booked in the selected period.',
            explanationKey: 'bookings.by_channel.booked',
            label: 'Booked',
          },
          'bookings.by_channel.showed': {
            definition: 'Appointments with an attended outcome.',
            explanationKey: 'bookings.by_channel.showed',
            label: 'Showed',
          },
          'bookings.by_channel.cancelled': {
            definition: 'Appointments with a cancelled outcome.',
            explanationKey: 'bookings.by_channel.cancelled',
            label: 'Cancelled',
          },
          'bookings.by_channel.upcoming': {
            definition: 'Future booked appointments.',
            explanationKey: 'bookings.by_channel.upcoming',
            label: 'Upcoming',
          },
        }}
        period={{ end: '2026-10-25', start: '2026-10-19' }}
        title="Bookings by Channel"
      />,
    )

    expect(html).toContain('Bookings by Channel')
    expect(html).toContain('Oct 19 – Oct 25')
    expect(html).toContain('4 new · 3 from earlier leads')
    expect(html).not.toContain('show rate')
    expect(html).toContain('Meta Ads')
    expect(html).toContain('Google Ads')
    expect(html).toContain('Bookings made during the selected period.')
    expect(html).not.toContain('Pending outcome')
    expect(html).toContain('aria-label="About Booked"')
    expect(html).toContain('aria-label="About Showed"')
    expect(html).toContain('aria-label="About Cancelled"')
    expect(html).toContain('aria-label="About Upcoming"')
    expect(html).toContain('aria-label="View booked appointments"')
    expect(html).toContain('aria-label="View showed appointments"')
    expect(html).toContain('aria-label="View cancelled appointments"')
    expect(html).toContain('aria-label="View upcoming appointments"')
    const upcomingLabelIndex = html.indexOf('>Upcoming<button')
    const upcomingActionIndex = html.indexOf('aria-label="View upcoming appointments"')
    const upcomingHelperIndex = html.indexOf('scheduled, not yet seen')
    expect(upcomingActionIndex).toBeGreaterThan(upcomingLabelIndex)
    expect(upcomingActionIndex).toBeLessThan(upcomingHelperIndex)
  })

  it('shows pending outcomes only when they exist', () => {
    const html = renderToStaticMarkup(
      <AnalyticsBookingActivityWidget
        data={{
          key: 'bookings.by_channel',
          rows: [{
            booked: 1,
            key: 'meta',
            label: 'Meta Ads',
            values: { pending: 1 },
          }],
          series: [{ key: 'pending', label: 'Pending outcome', tone: 'warning' }],
          summary: { booked: 1, pending: 1, upcoming: 0 },
          total: 1,
          totals: { pending: 1 },
        }}
        title="Bookings by Channel"
      />,
    )

    expect(html).toContain('Pending outcome')
    expect(html).toContain('1 pending outcome')
  })
})
