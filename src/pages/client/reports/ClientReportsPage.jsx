import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  CardContent,
  CardDescription,
  CardTitle,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
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
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatPeriod(report) {
  return `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`
}

function EmptyReportsState() {
  return (
    <Card className="border-dashed border-border-strong bg-block shadow-none">
      <CardContent className="py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-block bg-surface-subtle text-text-muted ring-1 ring-control-border">
            <Icon name="fileText" size={28} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-heading">No published report yet</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            The first monthly summary will appear here after the agency publishes it.
          </p>
        </div>
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

function ReportReader({ report }) {
  if (!report) {
    return (
      <Card className="border-control-border bg-block shadow-none">
        <CardContent className="py-8 text-sm text-text-muted">
          This report is not available. Draft and ready reports are hidden from the client portal.
        </CardContent>
      </Card>
    )
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
        <div className="flex flex-wrap gap-2 pt-2">
          {report.dashboardUrl ? (
            <Button asChild variant="outline">
              <a href={report.dashboardUrl} rel="noreferrer" target="_blank">
                Open dashboard
              </a>
            </Button>
          ) : null}
          {report.pdfUrl ? (
            <Button asChild variant="outline">
              <a href={report.pdfUrl} rel="noreferrer" target="_blank">
                Open PDF
              </a>
            </Button>
          ) : (
            <Button disabled type="button" variant="outline">
              PDF not available
            </Button>
          )}
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
        <CardTitle className="text-base">Report archive</CardTitle>
        <CardDescription>Published and archived reports, sorted by latest period first.</CardDescription>
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
              <span className="block font-semibold text-text-primary">{report.title}</span>
              <span className="mt-1 block text-xs text-text-muted">{formatPeriod(report)}</span>
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ReportReader report={page.selectedReport} />
      <aside>
        <ReportArchiveList clientId={clientId} reports={page.reports} selectedReport={page.selectedReport} />
      </aside>
    </div>
  )
}
