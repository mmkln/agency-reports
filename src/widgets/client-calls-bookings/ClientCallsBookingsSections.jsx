import {
  Badge,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  Progress,
  PropertyGrid,
} from '@/shared/ui'

import { ClinicAnalyticsFilterBar } from '../client-clinic-filters'
import { ClientClinicDataTrust } from '../client-clinic-data-trust'
import {
  OperationalInsightsSection,
  PeakCallTimesSection,
} from './ClientCallsBookingsOperationalSections'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`
}

function formatDuration(seconds) {
  if (!seconds) {
    return '0 sec'
  }

  if (seconds < 60) {
    return `${Math.round(seconds)} sec`
  }

  return `${Math.round(seconds / 60)} min`
}

function SummaryMetric({ helper, label, value }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-micro text-data tabular-nums text-text-primary">{value}</p>
      <p className="mt-item text-label font-normal text-text-secondary">{helper}</p>
    </article>
  )
}

function BookingMetricCard({ metric }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-ui font-medium text-text-primary">
            {metric.serviceLine?.name ?? 'Unassigned service line'}
          </h3>
          <p className="mt-2 text-body text-text-secondary">
            {metric.summary || 'No call handling summary provided.'}
          </p>
        </div>
        <Badge className="w-fit border-control-border bg-fill text-text-secondary" variant="outline">
          {metric.periodLabel}
        </Badge>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Total calls',
            value: formatNumber(metric.totalCalls),
          },
          {
            label: 'Missed',
            value: formatNumber(metric.missedCalls),
          },
          {
            label: 'Booked from calls',
            value: formatNumber(metric.bookedFromCalls),
          },
          {
            label: 'Avg. response',
            value: formatDuration(metric.averageResponseSeconds),
          },
        ]}
      />

      {metric.insight ? (
        <p className="mt-5 text-body text-text-secondary">{metric.insight}</p>
      ) : null}
    </article>
  )
}

function LeakageSection({ page }) {
  const maxCount = Math.max(...page.notBookedReasons.map((item) => item.count), 1)

  return (
    <Panel>
      <PanelHeader title="Booking Leakage" />
      <PanelBody className="grid gap-component">
        <PropertyGrid
          columns={4}
          items={[
            {
              label: 'Missed call rate',
              value: formatPercent(page.totals.missedRate),
            },
            {
              label: 'No-response leads',
              value: formatNumber(page.totals.noResponseLeads),
            },
            {
              label: 'Follow-up needed',
              value: formatNumber(page.totals.followUpNeededCount),
            },
            {
              label: 'Call booking rate',
              value: formatPercent(page.totals.callBookingRate),
            },
          ]}
        />

        {page.notBookedReasons.length ? (
          <div className="grid gap-component">
            {page.notBookedReasons.map((item) => (
              <div className="grid gap-item" key={item.reason}>
                <div className="flex items-center justify-between gap-component">
                  <span className="text-ui text-text-primary">{item.reason}</span>
                  <span className="text-label tabular-nums text-text-secondary">{formatNumber(item.count)}</span>
                </div>
                <Progress
                  aria-label={`${item.reason} not booked reason volume`}
                  value={(item.count / maxCount) * 100}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body text-text-secondary">No not-booked reason breakdown has been added yet.</p>
        )}
      </PanelBody>
    </Panel>
  )
}

export function ClientCallsBookingsView({ page }) {
  if (page.isEmpty) {
    return (
      <div className="grid gap-card">
        <ClinicAnalyticsFilterBar
          controls={[
            {
              allLabel: 'All locations',
              key: 'location_id',
              label: 'Location',
              options: page.filters?.availableLocations,
            },
            {
              allLabel: 'All service lines',
              key: 'service_line_id',
              label: 'Service line',
              options: page.filters?.availableServiceLines,
            },
            {
              allLabel: 'All reporting periods',
              key: 'period_label',
              label: 'Reporting period',
              options: page.filters?.availablePeriods,
            },
          ]}
          filters={page.filters}
        />
        <EmptyState
          description="Aggregate call and booking metrics will appear after the agency imports clinic-safe call tracking data or the current filters are cleared."
          iconName="phone"
          title="No calls and bookings data found"
        />
      </div>
    )
  }

  return (
    <div className="grid gap-card">
      <ClinicAnalyticsFilterBar
        controls={[
          {
            allLabel: 'All locations',
            key: 'location_id',
            label: 'Location',
            options: page.filters?.availableLocations,
          },
          {
            allLabel: 'All service lines',
            key: 'service_line_id',
            label: 'Service line',
            options: page.filters?.availableServiceLines,
          },
          {
            allLabel: 'All reporting periods',
            key: 'period_label',
            label: 'Reporting period',
            options: page.filters?.availablePeriods,
          },
        ]}
        filters={page.filters}
      />

      <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Calls and bookings summary">
        <SummaryMetric
          helper="Tracked inbound phone demand"
          label="Total calls"
          value={formatNumber(page.totals.totalCalls)}
        />
        <SummaryMetric
          helper="Calls not answered"
          label="Missed calls"
          value={formatNumber(page.totals.missedCalls)}
        />
        <SummaryMetric
          helper="Appointments booked by phone"
          label="Booked from calls"
          value={formatNumber(page.totals.bookedFromCalls)}
        />
        <SummaryMetric
          helper="Weighted by call volume"
          label="Avg. response"
          value={formatDuration(page.totals.averageResponseSeconds)}
        />
      </section>

      <LeakageSection page={page} />

      <OperationalInsightsSection clientId={page.client.id} insights={page.operationalInsights} />

      <PeakCallTimesSection peakCallTimes={page.peakCallTimes} />

      <Panel>
        <PanelHeader title="Service Line Call Handling" />
        <PanelBody className="grid gap-card">
          {page.metrics.map((metric) => (
            <BookingMetricCard key={metric.id} metric={metric} />
          ))}
        </PanelBody>
      </Panel>

      <ClientClinicDataTrust dataTrust={page.dataTrust} />
    </div>
  )
}
