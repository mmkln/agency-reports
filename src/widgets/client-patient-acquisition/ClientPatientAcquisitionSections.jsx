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

function formatCurrency(value) {
  if (!value) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`
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

function FunnelSection({ funnel }) {
  const maxValue = Math.max(...funnel.map((stage) => stage.value), 1)

  return (
    <Panel>
      <PanelHeader title="Patient Acquisition Funnel" />
      <PanelBody className="grid gap-component">
        {funnel.map((stage) => (
          <div className="grid gap-item" key={stage.id}>
            <div className="flex items-center justify-between gap-component">
              <span className="text-ui text-text-primary">{stage.label}</span>
              <span className="text-label tabular-nums text-text-secondary">{formatNumber(stage.value)}</span>
            </div>
            <Progress
              aria-label={`${stage.label} funnel volume`}
              value={(stage.value / maxValue) * 100}
            />
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function SnapshotCard({ snapshot }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-tag">
            <h3 className="text-ui font-medium text-text-primary">
              {snapshot.serviceLine?.name ?? 'Unassigned service line'}
            </h3>
            <Badge className="border-control-border bg-fill text-text-secondary" variant="outline">
              {snapshot.channelMeta?.label ?? 'Other'}
            </Badge>
          </div>
          <p className="mt-2 text-body text-text-secondary">
            {snapshot.summary || 'No summary provided.'}
          </p>
        </div>
        <span className="text-label font-normal text-text-muted">{snapshot.periodLabel}</span>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Inquiries',
            value: formatNumber(snapshot.inquiries),
          },
          {
            label: 'Booked',
            value: formatNumber(snapshot.bookedAppointments),
          },
          {
            label: 'Cost / booked',
            value: formatCurrency(snapshot.costPerBookedAppointment),
          },
          {
            label: 'Booking rate',
            value: formatPercent(snapshot.bookingRate),
          },
        ]}
      />

      {snapshot.insight ? (
        <p className="mt-5 text-body text-text-secondary">{snapshot.insight}</p>
      ) : null}
    </article>
  )
}

export function ClientPatientAcquisitionView({ page }) {
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
              allLabel: 'All campaigns',
              key: 'campaign_name',
              label: 'Campaign',
              options: page.filters?.availableCampaigns,
            },
            {
              allLabel: 'All channels',
              key: 'channel',
              label: 'Channel',
              options: page.filters?.availableChannels,
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
          description="Aggregate acquisition metrics will appear after the agency publishes clinic-safe reporting data or the current filters are cleared."
          iconName="target"
          title="No patient acquisition data found"
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
            allLabel: 'All campaigns',
            key: 'campaign_name',
            label: 'Campaign',
            options: page.filters?.availableCampaigns,
          },
          {
            allLabel: 'All channels',
            key: 'channel',
            label: 'Channel',
            options: page.filters?.availableChannels,
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

      <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Patient acquisition summary">
        <SummaryMetric
          helper="Calls, forms, and chats"
          label="New inquiries"
          value={formatNumber(page.totals.inquiries)}
        />
        <SummaryMetric
          helper="Confirmed appointments"
          label="Booked appointments"
          value={formatNumber(page.totals.bookedAppointments)}
        />
        <SummaryMetric
          helper="Spend divided by bookings"
          label="Cost / booked"
          value={formatCurrency(page.totals.costPerBookedAppointment)}
        />
        <SummaryMetric
          helper="Bookings from inquiries"
          label="Booking rate"
          value={formatPercent(page.totals.bookingRate)}
        />
      </section>

      <FunnelSection funnel={page.funnel} />

      <Panel>
        <PanelHeader title="Service Line Breakdown" />
        <PanelBody className="grid gap-card">
          {page.snapshots.map((snapshot) => (
            <SnapshotCard key={snapshot.id} snapshot={snapshot} />
          ))}
        </PanelBody>
      </Panel>

      <ClientClinicDataTrust dataTrust={page.dataTrust} sourceLinks={page.sourceLinks} />
    </div>
  )
}
