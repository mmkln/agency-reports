import {
  Button,
  PropertyGrid,
} from '@/shared/ui'

import { formatPeriod } from './formatters'

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

function formatRating(value) {
  return `${Number(value || 0).toFixed(1)} / 5`
}

function MetricTile({ helper, label, value }) {
  return (
    <article className="rounded-block bg-block p-block shadow-block">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-micro text-data tabular-nums text-text-primary">{value}</p>
      <p className="mt-item text-label font-normal text-text-secondary">{helper}</p>
    </article>
  )
}

function TextSection({ children, title }) {
  if (!children) {
    return null
  }

  return (
    <section className="rounded-control bg-block-subtle p-4">
      <h3 className="text-ui text-text-primary">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-body text-text-secondary">{children}</p>
    </section>
  )
}

function ContentGroup({ children, description, title }) {
  const renderedChildren = [children].flat().filter(Boolean)

  if (renderedChildren.length === 0) {
    return null
  }

  return (
    <section className="rounded-block bg-block p-4 shadow-block">
      <div className="mb-4">
        <h3 className="text-ui text-text-primary">{title}</h3>
        <p className="mt-1 text-label font-normal text-text-muted">{description}</p>
      </div>
      <div className="grid gap-3">
        {renderedChildren}
      </div>
    </section>
  )
}

function ListSection({ items, title }) {
  if (!items?.length) {
    return null
  }

  return (
    <section className="rounded-control bg-block-subtle p-4">
      <h3 className="text-ui text-text-primary">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li className="text-body text-text-secondary" key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function EvidenceLinks({ report }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label="Clinic report evidence">
      <div className="rounded-control bg-block-subtle p-4">
        <p className="text-ui text-text-primary">Source dashboard</p>
        <p className="mt-1 text-label font-normal text-text-muted">
          Aggregate clinic dashboard behind this patient acquisition summary.
        </p>
        {report.dashboardUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
              Open source dashboard
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
            Source dashboard is not available for this report.
          </p>
        )}
      </div>

      <div className="rounded-control bg-block-subtle p-4">
        <p className="text-ui text-text-primary">Clinic report file</p>
        <p className="mt-1 text-label font-normal text-text-muted">
          Formal PDF or external file, when the agency publishes one.
        </p>
        {report.pdfUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.pdfUrl} rel="noreferrer" target="_blank">
              Open clinic report file
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
            Report file is not available yet. Read the clinic summary inside the portal.
          </p>
        )}
      </div>
    </section>
  )
}

export function ClinicReportReader({ report }) {
  const sections = report.clinicSections
  const acquisition = sections.patientAcquisition
  const booking = sections.bookingLeakage
  const reputation = sections.reputation
  const compliance = sections.compliance

  return (
    <div className="grid gap-4">
      <section className="rounded-block bg-action-muted p-5">
        <p className="text-label text-action">Clinic growth summary</p>
        <h3 className="mt-1 text-heading text-text-primary">{report.title}</h3>
        <p className="mt-1 text-ui text-text-muted">{formatPeriod(report)}</p>
        {report.summary ? (
          <p className="mt-4 max-w-readable whitespace-pre-line text-body text-text-secondary">
            {report.summary}
          </p>
        ) : null}
      </section>

      <section className="grid gap-card md:grid-cols-2 xl:grid-cols-4" aria-label="Clinic report scoreboard">
        <MetricTile
          helper="Calls, forms, and chats"
          label="New inquiries"
          value={formatNumber(acquisition.inquiries)}
        />
        <MetricTile
          helper="Confirmed appointments"
          label="Booked appointments"
          value={formatNumber(acquisition.bookedAppointments)}
        />
        <MetricTile
          helper="Spend divided by bookings"
          label="Cost / booked"
          value={formatCurrency(acquisition.costPerBookedAppointment)}
        />
        <MetricTile
          helper={`${formatNumber(reputation.reviewsGained)} new reviews`}
          label="Google rating"
          value={formatRating(reputation.googleRating)}
        />
      </section>

      <section className="rounded-block bg-block p-4 shadow-block">
        <div className="mb-4">
          <h3 className="text-ui text-text-primary">Patient Acquisition</h3>
          <p className="mt-1 text-label font-normal text-text-muted">
            How online demand translated into booked new-patient appointments.
          </p>
        </div>
        <PropertyGrid
          columns={4}
          items={[
            {
              label: 'Inquiries',
              value: formatNumber(acquisition.inquiries),
            },
            {
              label: 'Booked appointments',
              value: formatNumber(acquisition.bookedAppointments),
            },
            {
              label: 'Top service lines',
              value: acquisition.topServiceLines.join(', ') || 'Not set',
            },
            {
              label: 'Top locations',
              value: acquisition.topLocations.join(', ') || 'Not set',
            },
          ]}
        />
        <TextSection title="Interpretation">{acquisition.summary}</TextSection>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <ContentGroup
          description="Where patient demand leaked after the first inquiry."
          title="Booking Leakage"
        >
          <PropertyGrid
            columns={1}
            items={[
              { label: 'Missed calls', value: formatNumber(booking.missedCalls) },
              { label: 'No-response leads', value: formatNumber(booking.noResponseLeads) },
              { label: 'Follow-up needed', value: formatNumber(booking.followUpNeeded) },
            ]}
          />
          <TextSection title="Interpretation">{booking.summary}</TextSection>
        </ContentGroup>

        <ContentGroup
          description="Local trust signals that affect new-patient conversion."
          title="Reputation"
        >
          <PropertyGrid
            columns={1}
            items={[
              { label: 'Google rating', value: formatRating(reputation.googleRating) },
              { label: 'Reviews gained', value: formatNumber(reputation.reviewsGained) },
              { label: 'Unanswered reviews', value: formatNumber(reputation.unansweredReviews) },
            ]}
          />
          <TextSection title="Interpretation">{reputation.summary}</TextSection>
        </ContentGroup>

        <ContentGroup
          description="Medical approvals, platform limits, and privacy/tracking risks."
          title="Compliance"
        >
          <PropertyGrid
            columns={1}
            items={[
              { label: 'Open issues', value: formatNumber(compliance.openIssues) },
              { label: 'Pending approvals', value: formatNumber(compliance.pendingApprovals) },
              { label: 'Limited ads', value: formatNumber(compliance.limitedAds) },
            ]}
          />
          <TextSection title="Interpretation">{compliance.summary}</TextSection>
        </ContentGroup>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ListSection items={sections.agencyWorkCompleted} title="Agency Work Completed" />
        <ListSection items={sections.clinicActionsNeeded} title="Clinic Actions Needed" />
        <ListSection items={sections.nextMonthPlan} title="Next Plan" />
      </div>

      <EvidenceLinks report={report} />
    </div>
  )
}
