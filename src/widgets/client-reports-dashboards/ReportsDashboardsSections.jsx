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
          <Link to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}>
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
              <Link to={`/client/reports?clientId=${clientId}`}>
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
