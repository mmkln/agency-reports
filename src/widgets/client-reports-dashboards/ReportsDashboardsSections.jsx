import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import {
  DashboardEmbedFrame,
  DashboardPageSummary,
  DashboardUnavailableState,
  NoDashboardState,
} from '../dashboard-embed'
import { ClientPerformanceDashboard } from '../client-performance'
import { Icon } from '../../shared/icons'

function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function formatPeriod(item) {
  return `${formatDate(item.periodStart)} - ${formatDate(item.periodEnd)}`
}

export function ResultsHeader({ page }) {
  const dashboard = page.performancePage.performanceDashboard
  const latestReport = page.reportsPage.latestReport
  const sourceDashboard = page.dashboardPage.dashboard

  return (
    <Panel>
      <PanelBody className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="text-label text-text-muted">Reports & Dashboards</p>
          <h2 className="mt-2 text-heading text-text-primary">{page.client.name}</h2>
          <p className="mt-2 max-w-readable text-body text-text-secondary">
            Current performance, source dashboards, and published reports in one client-facing results area.
          </p>
        </div>
        <div className="flex flex-wrap gap-tag lg:justify-end">
          {dashboard?.dataConfidenceMeta ? <StatusBadge meta={dashboard.dataConfidenceMeta} /> : null}
          {dashboard?.dataModeMeta ? <StatusBadge meta={dashboard.dataModeMeta} /> : null}
          {sourceDashboard?.statusMeta ? <StatusBadge meta={sourceDashboard.statusMeta} /> : null}
        </div>
      </PanelBody>
      <PanelBody className="grid gap-3 border-t border-separator px-5 py-4 md:grid-cols-3">
        <div>
          <p className="text-label text-text-muted">Current period</p>
          <p className="mt-1 text-ui text-text-primary">
            {dashboard ? formatPeriod(dashboard) : 'Performance period pending'}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Source dashboard</p>
          <p className="mt-1 text-ui text-text-primary">
            {sourceDashboard?.name ?? 'Not published yet'}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Latest report</p>
          <p className="mt-1 text-ui text-text-primary">
            {latestReport ? latestReport.title : 'No published report yet'}
          </p>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function CurrentPerformanceSection({ mode, performancePage }) {
  if (!performancePage.performanceDashboard) {
    return (
      <Panel>
        <PanelHeader
          subtitle="The agency has not published interpreted analytics for this client yet."
          title="Current Performance"
        />
        <PanelBody>
          <EmptyState
            description="Published outcome metrics, goals, trends, and interpretation will appear here after agency review."
            iconName="barChart"
            title="Current performance is being prepared"
          />
        </PanelBody>
      </Panel>
    )
  }

  return (
    <section className="grid gap-4" id="current-performance">
      <div>
        <p className="text-label text-text-muted">Current Performance</p>
        <h2 className="mt-1 text-heading text-text-primary">Business-value analytics</h2>
      </div>
      <ClientPerformanceDashboard
        mode={mode}
        page={performancePage}
        showRelatedLinks={false}
      />
    </section>
  )
}

function TrustContextItem({ label, meta, value }) {
  if (!value && !meta) {
    return null
  }

  return (
    <div>
      <p className="text-label text-text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {meta ? <StatusBadge meta={meta} /> : null}
        {value ? <p className="text-ui text-text-primary">{value}</p> : null}
      </div>
    </div>
  )
}

export function ResultsTrustContext({ trustContext }) {
  if (!trustContext) {
    return null
  }

  return (
    <Panel id="results-trust-context">
      <PanelHeader
        subtitle="Data freshness, source status, and interpretation caveats before the raw dashboard."
        title="Data Trust Context"
      />
      <PanelBody className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TrustContextItem
            label="Last updated"
            value={formatDate(trustContext.lastUpdatedAt)}
          />
          <TrustContextItem
            label="Freshness"
            value={trustContext.dataFreshness?.label ?? 'Update date unavailable'}
          />
          <TrustContextItem
            label="Confidence"
            meta={trustContext.dataConfidenceMeta}
          />
          <TrustContextItem
            label="Data source"
            meta={trustContext.dataModeMeta}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TrustContextItem
            label="Performance period"
            meta={trustContext.performancePeriod?.statusMeta}
            value={trustContext.performancePeriod ? formatPeriod(trustContext.performancePeriod) : 'Not published yet'}
          />
          <TrustContextItem
            label="Source dashboard"
            meta={trustContext.sourceDashboard?.statusMeta}
            value={trustContext.sourceDashboard?.name ?? 'Not published yet'}
          />
          <TrustContextItem
            label="Latest report"
            meta={trustContext.latestReport?.statusMeta}
            value={trustContext.latestReport ? formatPeriod(trustContext.latestReport) : 'No published report yet'}
          />
        </div>

        {trustContext.caveats.length ? (
          <div className="grid gap-3">
            {trustContext.caveats.map((caveat) => (
              <div className="rounded-control bg-block-subtle p-4" key={caveat.id}>
                <p className="text-label text-text-muted">{caveat.label}</p>
                <p className="mt-2 text-body text-text-secondary">{caveat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function SourceDashboardSection({ clientId, dashboardPage }) {
  const dashboard = dashboardPage.dashboard

  return (
    <section className="grid gap-4" id="source-dashboard">
      <div>
        <p className="text-label text-text-muted">Source Dashboard</p>
        <h2 className="mt-1 text-heading text-text-primary">External dashboard detail</h2>
      </div>

      {!dashboard ? (
        <NoDashboardState />
      ) : (
        <>
          <DashboardPageSummary clientId={clientId} dashboard={dashboard} />
          {!dashboard.isAvailable ? (
            <DashboardUnavailableState dashboard={dashboard} />
          ) : (
            <DashboardEmbedFrame dashboard={dashboard} />
          )}
        </>
      )}
    </section>
  )
}

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

function ReportArchiveItem({ clientId, report }) {
  return (
    <article className="rounded-block border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-ui text-text-primary">{report.title}</h3>
            <StatusBadge meta={report.statusMeta} />
          </div>
          <p className="mt-1 text-label font-normal text-text-muted">{formatPeriod(report)}</p>
          {report.summary ? (
            <p className="mt-2 line-clamp-3 text-body text-text-secondary">{report.summary}</p>
          ) : null}
        </div>
        <Button asChild className="shrink-0" size="sm" variant="outline">
          <Link to={`/client/reports-dashboards?clientId=${clientId}&reportId=${report.id}`}>
            Read report
            <Icon name="arrowRight" size={14} />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function ReportArchiveSection({ clientId, reportsPage }) {
  const reports = reportsPage.reports

  return (
    <Panel id="report-archive">
      <PanelHeader
        action={(
          reports.length ? (
            <Button asChild size="sm" variant="outline">
              <Link to={`/client/reports-dashboards?clientId=${clientId}#report-archive`}>
                Open archive
              </Link>
            </Button>
          ) : null
        )}
        subtitle="Published monthly and campaign summaries remain available here."
        title="Report Archive"
      />
      <PanelBody className="grid gap-3">
        {reports.length ? (
          reports.slice(0, 6).map((report) => (
            <ReportArchiveItem clientId={clientId} key={report.id} report={report} />
          ))
        ) : (
          <EmptyState
            description="The first report will appear here after the agency publishes it."
            iconName="fileText"
            title="No published reports yet"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
