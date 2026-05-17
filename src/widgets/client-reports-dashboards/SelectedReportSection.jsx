import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import { formatPeriod } from './formatters'

function ReportLinkActions({ report }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <p className="text-ui text-text-primary">Dashboard</p>
        <p className="mt-1 text-label font-normal text-text-muted">
          Marketing numbers that support this summary.
        </p>
        {report.dashboardUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
              Open dashboard
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
            Dashboard link is not available for this report.
          </p>
        )}
      </div>

      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <p className="text-ui text-text-primary">Full report / PDF</p>
        <p className="mt-1 text-label font-normal text-text-muted">
          Formal report file, when the agency provides one.
        </p>
        {report.pdfUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.pdfUrl} rel="noreferrer" target="_blank">
              Open PDF
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
            PDF version is not available yet. Read the summary inside the portal.
          </p>
        )}
      </div>
    </div>
  )
}

function ReportTextSection({ children, title }) {
  if (!children) {
    return null
  }

  return (
    <section className="rounded-control border border-control-border bg-block-subtle p-4">
      <h3 className="text-ui text-text-primary">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-body text-text-secondary">{children}</p>
    </section>
  )
}

function ReportContentGroup({ children, description, title }) {
  const renderedChildren = [children].flat().filter(Boolean)

  if (renderedChildren.length === 0) {
    return null
  }

  return (
    <section className="rounded-block border border-control-border bg-block p-4">
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

function ReportPreviewNotice({ report }) {
  if (report.isClientVisible) {
    return null
  }

  return (
    <Panel className="bg-warning-muted">
      <PanelBody className="flex items-start gap-control py-4">
        <span className="flex size-control-small shrink-0 items-center justify-center rounded-control bg-block text-warning-foreground">
          <Icon name="triangleAlert" size={16} />
        </span>
        <div>
          <h2 className="text-ui text-text-primary">Preview only</h2>
          <p className="mt-1 text-body text-text-secondary">
            Preview only. This report is not visible to the client. Publish it when the client-facing narrative is ready.
          </p>
        </div>
      </PanelBody>
    </Panel>
  )
}

function ReportReader({ report }) {
  return (
    <Panel>
      <PanelHeader
        action={<StatusBadge meta={report.statusMeta} />}
        subtitle={formatPeriod(report)}
        title={report.title}
      />
      <PanelBody className="grid gap-4">
        <section className="rounded-block bg-action-muted p-5">
          <p className="text-label text-action">Executive summary</p>
          <h3 className="mt-1 text-heading text-text-primary">{report.title}</h3>
          <p className="mt-1 text-ui text-text-muted">{formatPeriod(report)}</p>
          {report.summary ? (
            <p className="mt-4 max-w-readable whitespace-pre-line text-body text-text-secondary">
              {report.summary}
            </p>
          ) : (
            <p className="mt-4 rounded-control bg-block px-3 py-2 text-ui text-text-muted">
              No executive summary was added for this report.
            </p>
          )}
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          <ReportContentGroup
            description="What the agency worked on and where the period gained traction."
            title="What happened"
          >
            <ReportTextSection title="What we did">{report.whatWeDid}</ReportTextSection>
            <ReportTextSection title="Wins">{report.wins}</ReportTextSection>
          </ReportContentGroup>
          <ReportContentGroup
            description="Performance context and risks the client should understand."
            title="Performance context"
          >
            <ReportTextSection title="Results">{report.results}</ReportTextSection>
            <ReportTextSection title="Problems / blockers">{report.problems}</ReportTextSection>
          </ReportContentGroup>
          <ReportContentGroup
            description="What happens next and what the agency needs from the client."
            title="Next steps"
          >
            <ReportTextSection title="Next actions">{report.nextActions}</ReportTextSection>
            <ReportTextSection title="Needed from client">{report.clientDecisionsNeeded}</ReportTextSection>
          </ReportContentGroup>
        </div>

        <ReportLinkActions report={report} />
      </PanelBody>
    </Panel>
  )
}

export function SelectedReportSection({ clientId, reportsPage }) {
  if (reportsPage.reason === 'report_not_found') {
    return (
      <Panel>
        <PanelBody className="py-8">
          <EmptyState
            action={reportsPage.latestReport ? (
              <Button asChild variant="outline">
                <Link to={`/client/reports-dashboards?clientId=${clientId}&reportId=${reportsPage.latestReport.id}`}>
                  Go to latest report
                </Link>
              </Button>
            ) : null}
            description={reportsPage.latestReport
              ? 'This report is unavailable, unpublished, or no longer part of your client archive. The latest published report is still available.'
              : 'This report is unavailable, unpublished, or no longer part of your client archive.'}
            iconName="fileText"
            title="Report unavailable"
          />
        </PanelBody>
      </Panel>
    )
  }

  if (!reportsPage.selectedReport) {
    return null
  }

  return (
    <section className="grid gap-4" id="selected-report">
      <div>
        <p className="text-label text-text-muted">Selected Report</p>
        <h2 className="mt-1 text-heading text-text-primary">Narrative report</h2>
      </div>
      <ReportPreviewNotice report={reportsPage.selectedReport} />
      <ReportReader report={reportsPage.selectedReport} />
    </section>
  )
}
