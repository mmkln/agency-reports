import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { ContactAskQuestionBlock } from './ContactAskQuestionBlock'
import { FilesLinksOverviewBlock } from './FilesLinksOverviewBlock'
import { NeededFromClientBlock } from './NeededFromClientBlock'
import { ReportsDashboardsOverviewBlock } from './ReportsDashboardsOverviewBlock'
import { SectionCard } from './_shared'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

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

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`
}

function formatRating(value) {
  return `${Number(value || 0).toFixed(1)} / 5`
}

function ClinicMetricCard({ helper, href, iconName, label, value }) {
  return (
    <Link className="rounded-block bg-block p-block shadow-block transition-colors hover:bg-block-subtle" to={href}>
      <div className="flex items-start justify-between gap-component">
        <div>
          <p className="text-label text-text-muted">{label}</p>
          <p className="mt-micro text-data tabular-nums text-text-primary">{value}</p>
          <p className="mt-item text-label font-normal text-text-secondary">{helper}</p>
        </div>
        <span className="text-text-quaternary">
          <Icon name={iconName} size={18} />
        </span>
      </div>
    </Link>
  )
}

function ClinicSnapshot({ clinicOverview }) {
  const acquisition = clinicOverview.patientAcquisition
  const booking = clinicOverview.booking
  const reputation = clinicOverview.reputation
  const compliance = clinicOverview.compliance

  return (
    <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Clinic control center summary">
      <ClinicMetricCard
        helper={`${formatNumber(acquisition?.inquiries)} inquiries`}
        href={acquisition?.href ?? clinicOverview.serviceLinesHref}
        iconName="target"
        label="Booked appointments"
        value={formatNumber(acquisition?.bookedAppointments)}
      />
      <ClinicMetricCard
        helper={`${formatPercent(booking?.missedRate)} missed call rate`}
        href={booking?.href ?? clinicOverview.serviceLinesHref}
        iconName="phone"
        label="Missed calls"
        value={formatNumber(booking?.missedCalls)}
      />
      <ClinicMetricCard
        helper={`${formatNumber(reputation?.unansweredReviews)} unanswered`}
        href={reputation?.href ?? clinicOverview.serviceLinesHref}
        iconName="messageSquare"
        label="Reviews gained"
        value={formatNumber(reputation?.reviewsGained)}
      />
      <ClinicMetricCard
        helper={`${formatNumber(compliance?.pendingApprovals)} approvals pending`}
        href={compliance?.href ?? clinicOverview.serviceLinesHref}
        iconName="shieldCheck"
        label="Compliance issues"
        value={formatNumber(compliance?.openIssues)}
      />
    </section>
  )
}

function ClinicAcquisitionBlock({ clinicOverview }) {
  const acquisition = clinicOverview.patientAcquisition

  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="ghost">
          <Link to={acquisition?.href ?? clinicOverview.serviceLinesHref}>
            View funnel
            <Icon name="arrowUpRight" size={13} />
          </Link>
        </Button>
      )}
      contentClassName="grid gap-component"
      description="Demand, booked appointments, and the best current service line."
      iconName="target"
      title="Patient Acquisition"
    >
      <div className="grid gap-component sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-label text-text-muted">Cost per booked appointment</p>
          <p className="mt-micro text-title text-text-primary">
            {formatCurrency(acquisition?.costPerBookedAppointment)}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Top service line</p>
          <p className="mt-micro text-title text-text-primary">{acquisition?.topServiceLine ?? 'Not enough data'}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Top location</p>
          <p className="mt-micro text-title text-text-primary">{acquisition?.topLocation ?? 'Not enough data'}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Clinic actions needed</p>
          <p className="mt-micro text-title text-text-primary">{formatNumber(clinicOverview.actionNeededCount)}</p>
        </div>
      </div>
    </SectionCard>
  )
}

function ClinicRiskBlocks({ clinicOverview }) {
  const booking = clinicOverview.booking
  const reputation = clinicOverview.reputation
  const compliance = clinicOverview.compliance

  return (
    <div className="grid gap-card lg:grid-cols-3">
      <SectionCard iconName="phone" title="Booking Leakage">
        <p className="text-title text-text-primary">{formatNumber(booking?.noResponseLeads)} no-response leads</p>
        <p className="mt-2 text-body text-text-secondary">
          {formatNumber(booking?.followUpNeededCount)} follow-ups are still needed from call or form handling.
        </p>
      </SectionCard>
      <SectionCard iconName="messageSquare" title="Reputation">
        <p className="text-title text-text-primary">{formatRating(reputation?.googleRating)}</p>
        <p className="mt-2 text-body text-text-secondary">
          {formatNumber(reputation?.unansweredReviews)} reviews still need a response.
        </p>
      </SectionCard>
      <SectionCard iconName="shieldCheck" title="Compliance">
        <p className="text-title text-text-primary">{formatNumber(compliance?.riskFlaggedReviews)} risk flagged</p>
        <p className="mt-2 text-body text-text-secondary">
          {formatNumber(compliance?.limitedAds)} campaign assets are currently limited by policy.
        </p>
      </SectionCard>
    </div>
  )
}

export function ClientClinicOverviewView({ overview }) {
  return (
    <div className="grid gap-card">
      <ClinicSnapshot clinicOverview={overview.clinicOverview} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="grid gap-6">
          <ClinicAcquisitionBlock clinicOverview={overview.clinicOverview} />
          <ClinicRiskBlocks clinicOverview={overview.clinicOverview} />
          <NeededFromClientBlock
            actions={overview.neededActions}
            requestsHref={`/client/action-needed?clientId=${overview.client.id}`}
          />
        </div>
        <aside className="grid gap-6">
          <ReportsDashboardsOverviewBlock
            clientId={overview.client.id}
            dashboard={overview.dashboard}
            performancePreview={overview.performancePreview}
            report={overview.latestReport}
          />
          <FilesLinksOverviewBlock
            clientId={overview.client.id}
            fileLinks={overview.fileLinksPreview}
          />
          <ContactAskQuestionBlock client={overview.client} />
        </aside>
      </div>
    </div>
  )
}
