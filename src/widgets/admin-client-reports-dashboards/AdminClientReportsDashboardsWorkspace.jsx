import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '@/shared/icons'

import { formatDate, formatPeriod, takeRecent } from './reportsDashboardsFormatters'

function SectionShell({
  actionHref,
  actionLabel,
  children,
  iconName,
  title,
}) {
  return (
    <Panel>
      <PanelHeader
        action={(
          <Button asChild size="sm" variant="outline">
            <Link to={actionHref}>
              {actionLabel}
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </Button>
        )}
        iconName={iconName}
        title={title}
      />
      <PanelBody>
        {children}
      </PanelBody>
    </Panel>
  )
}

function ResourceRow({
  children,
  href,
  meta,
  statusMeta,
  title,
}) {
  return (
    <Link
      className="block rounded-control border border-control-border bg-block-subtle p-3 no-underline transition-colors hover:bg-fill-tertiary"
      to={href}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-ui text-text-primary">{title}</p>
          <p className="mt-1 text-label font-normal text-text-muted">{meta}</p>
          {children ? <p className="mt-2 line-clamp-2 text-ui text-text-secondary">{children}</p> : null}
        </div>
        {statusMeta ? <StatusBadge meta={statusMeta} /> : null}
      </div>
    </Link>
  )
}

function getExecutiveSummaryText(content) {
  const summary = content?.executive_summary

  if (!summary) {
    return 'No executive summary yet.'
  }

  if (typeof summary === 'string') {
    return summary
  }

  return summary.narrative || summary.main_win || summary.next_focus || 'No executive summary yet.'
}

function PerformanceSection({ clientId, periods }) {
  const manageHref = `/admin/performance-dashboards?clientId=${clientId}`

  return (
    <SectionShell
      actionHref={manageHref}
      actionLabel="Manage"
      iconName="barChart"
      title="Current Performance"
    >
      {periods.length > 0 ? (
        <div className="grid gap-2">
          {takeRecent(periods).map((period) => (
            <ResourceRow
              href={`/admin/performance-dashboard-editor?periodId=${period.id}`}
              key={period.id}
              meta={formatPeriod(period.periodStart, period.periodEnd)}
              statusMeta={period.statusMeta}
              title={period.title}
            >
              {getExecutiveSummaryText(period.content)}
            </ResourceRow>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Create interpreted performance periods before publishing the client-facing results view."
          iconName="barChart"
          title="No performance periods"
        />
      )}
    </SectionShell>
  )
}

function SourceDashboardsSection({ clientId, dashboardLinks }) {
  const manageHref = `/admin/dashboard-links?clientId=${clientId}`

  return (
    <SectionShell
      actionHref={manageHref}
      actionLabel="Manage"
      iconName="layoutDashboard"
      title="Source Dashboards"
    >
      {dashboardLinks.length > 0 ? (
        <div className="grid gap-2">
          {takeRecent(dashboardLinks).map((dashboardLink) => (
            <ResourceRow
              href={manageHref}
              key={dashboardLink.id}
              meta={`${dashboardLink.providerMeta.label} - checked ${formatDate(dashboardLink.lastCheckedAt)}`}
              statusMeta={dashboardLink.statusMeta}
              title={dashboardLink.name}
            >
              {dashboardLink.publicUrl || dashboardLink.embedUrl || 'No URL saved yet.'}
            </ResourceRow>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Add Looker Studio, AgencyAnalytics, Databox, or other source dashboards as controlled client resources."
          iconName="layoutDashboard"
          title="No source dashboards"
        />
      )}
    </SectionShell>
  )
}

function ReportsSection({ clientId, reports }) {
  const manageHref = `/admin/reports?clientId=${clientId}`

  return (
    <SectionShell
      actionHref={manageHref}
      actionLabel="Manage"
      iconName="fileText"
      title="Report Archive"
    >
      {reports.length > 0 ? (
        <div className="grid gap-2">
          {takeRecent(reports).map((report) => (
            <ResourceRow
              href={manageHref}
              key={report.id}
              meta={formatPeriod(report.periodStart, report.periodEnd)}
              statusMeta={report.statusMeta}
              title={report.title}
            >
              {report.summary || 'No executive summary yet.'}
            </ResourceRow>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Create monthly, weekly, campaign, or custom reports after agency review."
          iconName="fileText"
          title="No reports"
        />
      )}
    </SectionShell>
  )
}

export function AdminClientReportsDashboardsWorkspace({
  clientId,
  dashboardLinks,
  periods,
  reports,
}) {
  return (
    <div className="grid gap-card">
      <div className="grid gap-card xl:grid-cols-3">
        <PerformanceSection clientId={clientId} periods={periods} />
        <SourceDashboardsSection clientId={clientId} dashboardLinks={dashboardLinks} />
        <ReportsSection clientId={clientId} reports={reports} />
      </div>
    </div>
  )
}
