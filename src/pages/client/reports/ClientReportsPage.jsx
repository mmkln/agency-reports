import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import {
  Badge,
  Button,
  CardContent,
  CardDescription,
  CardTitle,
  EmptyState,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
  Separator,
  StatusBadge,
} from '@/shared/ui'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientReportsPage } from '../../../domain/services/clientReportsService'
import { USER_ROLES } from '../../../entities/profile'
import { Icon } from '../../../shared/icons'
import { AccessDeniedState } from '../../../widgets/client-overview'

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

function formatPeriod(report) {
  return `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`
}

function EmptyReportsState() {
  return (
    <Card className="border-dashed border-border-strong bg-block shadow-none">
      <CardContent className="py-12">
        <EmptyState
          className="mx-auto max-w-lg items-center text-center"
          description="The first monthly summary will appear here after the agency publishes it."
          iconName="fileText"
          title="No published report yet"
        />
      </CardContent>
    </Card>
  )
}

function ReportUnavailableState({ clientId, latestReport }) {
  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardContent className="py-8">
        <EmptyState
          action={latestReport ? (
            <Button asChild variant="outline">
              <Link to={`/client/reports?clientId=${clientId}&reportId=${latestReport.id}`}>
                Go to latest report
              </Link>
            </Button>
          ) : null}
          description="This report is unavailable, unpublished, or no longer part of your client archive."
          iconName="fileText"
          title="Report unavailable"
        />
      </CardContent>
    </Card>
  )
}

function ReportSection({ children, title }) {
  if (!children) {
    return null
  }

  return (
    <section className="rounded-block border border-control-border bg-block-subtle p-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">{children}</p>
    </section>
  )
}

function ReportLinkActions({ report }) {
  return (
    <div className="grid gap-3 pt-2 sm:grid-cols-2">
      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Dashboard</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Marketing numbers that support this summary.
            </p>
          </div>
          <Icon className="text-action" name="layoutDashboard" size={20} />
        </div>
        {report.dashboardUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
              Open dashboard
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-xs text-text-muted">
            Dashboard link is not available for this report.
          </p>
        )}
      </div>

      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Full report / PDF</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Formal report file, when the agency provides one.
            </p>
          </div>
          <Icon className="text-destructive" name="fileText" size={20} />
        </div>
        {report.pdfUrl ? (
          <Button asChild className="mt-4 w-full" variant="outline">
            <a href={report.pdfUrl} rel="noreferrer" target="_blank">
              Open PDF
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-xs text-text-muted">
            PDF version is not available yet. Read the summary inside the portal.
          </p>
        )}
      </div>
    </div>
  )
}

function ReportReader({ report }) {
  if (!report) {
    return null
  }

  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardHeader className="border-b border-separator bg-surface-subtle">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{report.title}</CardTitle>
            <CardDescription className="mt-1">{formatPeriod(report)}</CardDescription>
          </div>
          <StatusBadge meta={report.statusMeta} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 py-5">
        <ReportSection title="Executive summary">{report.summary}</ReportSection>
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="What we did">{report.whatWeDid}</ReportSection>
          <ReportSection title="Results">{report.results}</ReportSection>
          <ReportSection title="Wins">{report.wins}</ReportSection>
          <ReportSection title="Problems / blockers">{report.problems}</ReportSection>
          <ReportSection title="Next actions">{report.nextActions}</ReportSection>
          <ReportSection title="Needed from client">{report.clientDecisionsNeeded}</ReportSection>
        </div>
        <ReportLinkActions report={report} />
      </CardContent>
    </Card>
  )
}

function LatestReportSummary({ clientId, report, selectedReport }) {
  if (!report) {
    return null
  }

  const isSelected = selectedReport?.id === report.id

  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardHeader className="border-b border-separator bg-surface-subtle">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Latest monthly summary</CardTitle>
            <CardDescription className="mt-1">{formatPeriod(report)}</CardDescription>
          </div>
          <StatusBadge meta={report.statusMeta} />
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <h3 className="font-semibold text-text-primary">{report.title}</h3>
        {report.summary ? (
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-text-secondary">{report.summary}</p>
        ) : (
          <p className="mt-2 text-sm text-text-muted">No executive summary was added.</p>
        )}
        <Separator className="my-4" />
        <div className="grid gap-2">
          {isSelected ? (
            <Button disabled size="sm" type="button" variant="outline">
              Currently open
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}>
                Open latest report
              </Link>
            </Button>
          )}
          {report.dashboardUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
                Open latest dashboard
              </a>
            </Button>
          ) : null}
          {report.pdfUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={report.pdfUrl} rel="noreferrer" target="_blank">
                Open latest PDF
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function ReportArchiveList({ clientId, reports, selectedReport }) {
  if (reports.length === 0) {
    return null
  }

  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardHeader className="border-b border-separator bg-surface-subtle">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Report archive</CardTitle>
            <CardDescription className="mt-1">Newest reporting periods first.</CardDescription>
          </div>
          <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
            {reports.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 py-4">
        {reports.map((report) => {
          const isSelected = selectedReport?.id === report.id

          return (
            <Link
              className={isSelected
                ? 'rounded-block border border-brand bg-action-muted px-4 py-3 text-sm shadow-none'
                : 'rounded-block border border-control-border bg-block px-4 py-3 text-sm transition-colors hover:bg-surface-subtle'}
              key={report.id}
              to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-text-primary">{report.title}</span>
                  <span className="mt-1 block text-xs text-text-muted">{formatPeriod(report)}</span>
                </span>
                <StatusBadge meta={report.statusMeta} />
              </span>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

function createUuid() {
  return crypto.randomUUID()
}

function recordClientReportOpened({ clientId, reportId, runtime }) {
  if (runtime.viewer.role !== USER_ROLES.CLIENT_USER || !reportId) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType: ACTIVITY_EVENT_TYPES.REPORT_OPENED,
    idGenerator: createUuid,
    metadata: {
      reportId,
    },
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}

export function ClientReportsPage({ routeParams = {}, runtime }) {
  const recordedReportOpenRef = useRef('')
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientReportsPage({
    clientId,
    reportId: routeParams.reportId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
  const selectedReportId = page.selectedReport?.id ?? ''

  useEffect(() => {
    if (page.status !== 'ready' || !selectedReportId || recordedReportOpenRef.current === selectedReportId) {
      return
    }

    recordedReportOpenRef.current = selectedReportId
    recordClientReportOpened({
      clientId,
      reportId: selectedReportId,
      runtime,
    })
  }, [clientId, page.status, runtime, selectedReportId])

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  if (page.reports.length === 0) {
    return <EmptyReportsState />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {page.selectedReport ? (
        <ReportReader report={page.selectedReport} />
      ) : (
        <ReportUnavailableState clientId={clientId} latestReport={page.latestReport} />
      )}
      <aside className="grid content-start gap-4">
        <LatestReportSummary clientId={clientId} report={page.latestReport} selectedReport={page.selectedReport} />
        <ReportArchiveList clientId={clientId} reports={page.reports} selectedReport={page.selectedReport} />
      </aside>
    </div>
  )
}
