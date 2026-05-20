import {
  Badge,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  StatusBadge,
} from '@/shared/ui'

import { ClinicAnalyticsFilterBar } from '../client-clinic-filters'
import { ClientClinicDataTrust } from '../client-clinic-data-trust'

function formatCurrency(value) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatNumber(value) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value)
}

function formatChannel(value) {
  if (!value) {
    return 'Not set'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function ServiceLineCard({ serviceLine }) {
  const locationLabel = serviceLine.locations.length
    ? serviceLine.locations.map((location) => location.name).join(', ')
    : 'No location assigned'
  const latestPerformance = serviceLine.latestPerformance
  const performanceTotals = serviceLine.performanceTotals

  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-tag">
            <h3 className="text-ui font-medium text-text-primary">{serviceLine.name}</h3>
            <StatusBadge meta={serviceLine.statusMeta} />
            {latestPerformance?.campaignStatusMeta ? <StatusBadge meta={latestPerformance.campaignStatusMeta} /> : null}
            {latestPerformance?.complianceStatusMeta ? <StatusBadge meta={latestPerformance.complianceStatusMeta} /> : null}
          </div>
          <p className="mt-2 text-body text-text-secondary">
            {latestPerformance?.summary || serviceLine.capacityNote || 'Capacity note not set.'}
          </p>
        </div>
        <Badge className="w-fit border-control-border bg-fill text-text-secondary" variant="outline">
          {latestPerformance?.campaignName || formatChannel(serviceLine.primaryChannel)}
        </Badge>
      </div>

      <PropertyGrid
        className="mt-5"
        columns={4}
        items={[
          {
            label: 'Spend',
            value: formatCurrency(performanceTotals.spend),
          },
          {
            label: 'Inquiries',
            value: formatNumber(performanceTotals.inquiries),
          },
          {
            label: 'Booked appointments',
            value: formatNumber(performanceTotals.bookedAppointments),
          },
          {
            label: 'Cost per booking',
            value: formatCurrency(performanceTotals.costPerBookedAppointment),
          },
          {
            label: 'Cost per inquiry',
            value: formatCurrency(performanceTotals.costPerInquiry),
          },
          {
            label: 'Conversion rate',
            value: formatPercent(performanceTotals.bookingRate),
          },
          {
            label: 'Landing page',
            value: latestPerformance?.landingPageStatus || 'Not set',
          },
          {
            label: 'Ad approval',
            value: latestPerformance?.adApprovalStatus || 'Not set',
          },
          {
            label: 'Target bookings',
            value: formatNumber(serviceLine.targetMonthlyBookings),
          },
          {
            label: 'Avg. value',
            value: formatCurrency(serviceLine.averageValue),
          },
          {
            label: 'Locations',
            value: locationLabel,
          },
          {
            label: 'Updated',
            value: serviceLine.updatedAt ? new Date(serviceLine.updatedAt).toLocaleDateString() : 'Not set',
          },
        ]}
      />
    </article>
  )
}

function ClinicProfilePanel({ page }) {
  const profile = page.profile

  return (
    <Panel>
      <PanelHeader
        title="Clinic Focus"
      />
      <PanelBody>
        <PropertyGrid
          columns={3}
          items={[
            {
              label: 'Specialty',
              value: profile?.specialtyMeta?.label,
            },
            {
              label: 'Primary goal',
              value: profile?.primaryGoal,
            },
            {
              label: 'Insurance model',
              value: profile?.insuranceModel,
            },
          ]}
        />
        {profile?.capacityNotes ? (
          <p className="mt-5 text-body text-text-secondary">{profile.capacityNotes}</p>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function ClientServiceLinesView({ page }) {
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
            allLabel: 'All campaign statuses',
            key: 'campaign_status',
            label: 'Campaign status',
            options: page.filters?.availableCampaignStatuses,
          },
          {
            allLabel: 'All compliance statuses',
            key: 'compliance_status',
            label: 'Compliance status',
            options: page.filters?.availableComplianceStatuses,
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
      <ClinicProfilePanel page={page} />
      <Panel>
        <PanelHeader
          title="Service Lines"
        />
        <PanelBody className="grid gap-card">
          {page.serviceLines.length ? (
            page.serviceLines.map((serviceLine) => (
              <ServiceLineCard key={serviceLine.id} serviceLine={serviceLine} />
            ))
          ) : (
            <EmptyState
              description="Clinic service lines will appear after the team defines the patient acquisition focus."
              iconName="stethoscope"
              title="No service lines yet"
            />
          )}
        </PanelBody>
      </Panel>
      <ClientClinicDataTrust dataTrust={page.dataTrust} />
    </div>
  )
}
