import { Children, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Badge,
  Button,
  CardContent,
  CardDescription,
  CardTitle,
  EmptyState,
  Input,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

const REPORT_ARCHIVE_FILTER_ALL = 'all'

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

function getReportYear(report) {
  const parsedDate = new Date(report.periodEnd || report.periodStart)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return String(parsedDate.getFullYear())
}

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function filterReports(reports, filters) {
  const search = normalizeSearchValue(filters.search)

  return reports.filter((report) => {
    if (filters.status !== REPORT_ARCHIVE_FILTER_ALL && report.status !== filters.status) {
      return false
    }

    if (filters.year !== REPORT_ARCHIVE_FILTER_ALL && getReportYear(report) !== filters.year) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      report.clientDecisionsNeeded,
      report.nextActions,
      report.problems,
      report.results,
      report.summary,
      report.title,
      report.whatWeDid,
      report.wins,
    ].some((value) => normalizeSearchValue(value).includes(search))
  })
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
          description={latestReport
            ? 'This report is unavailable, unpublished, or no longer part of your client archive. The latest published report is still available.'
            : 'This report is unavailable, unpublished, or no longer part of your client archive.'}
          iconName="fileText"
          title="Report unavailable"
        />
      </CardContent>
    </Card>
  )
}

function PreviewOnlyNotice({ report }) {
  if (report.isClientVisible) {
    return null
  }

  return (
    <Card className="border-warning/30 bg-warning/10 shadow-none">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-block text-warning-foreground ring-1 ring-warning/20">
          <Icon name="eye" size={18} />
        </span>
        <div>
          <h2 className="text-ui text-text-primary">Preview only</h2>
          <p className="mt-1 text-body text-text-secondary">
            Preview only. This report is not visible to the client. Publish it when the client-facing
            narrative is ready.
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
      <h3 className="text-ui text-text-primary">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-body text-text-secondary">{children}</p>
    </section>
  )
}

function ReportExecutiveSummary({ report }) {
  return (
    <section className="rounded-block border border-brand/20 bg-action-muted p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label text-action">Executive summary</p>
          <h3 className="mt-1 text-heading text-text-primary">{report.title}</h3>
          <p className="mt-1 text-ui text-text-muted">{formatPeriod(report)}</p>
        </div>
        {report.publishedAt ? (
          <Badge className="w-fit border-control-border bg-block text-text-secondary" variant="outline">
            Published {formatDate(report.publishedAt)}
          </Badge>
        ) : null}
      </div>
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
  )
}

function ReportContentGroup({ children, description, title }) {
  const renderedChildren = Children.toArray(children).filter(Boolean)

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

function ReportLinkActions({ report }) {
  return (
    <div className="grid gap-3 pt-2 sm:grid-cols-2">
      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ui text-text-primary">Dashboard</p>
            <p className="mt-1 text-label font-normal text-text-muted">
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
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
            Dashboard link is not available for this report.
          </p>
        )}
      </div>

      <div className="rounded-control border border-control-border bg-block-subtle p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ui text-text-primary">Full report / PDF</p>
            <p className="mt-1 text-label font-normal text-text-muted">
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
          <p className="mt-4 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
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
        <ReportExecutiveSummary report={report} />
        <div className="grid gap-4 xl:grid-cols-3">
          <ReportContentGroup
            description="What the agency worked on and where the month gained traction."
            title="What happened"
          >
            <ReportSection title="What we did">{report.whatWeDid}</ReportSection>
            <ReportSection title="Wins">{report.wins}</ReportSection>
          </ReportContentGroup>
          <ReportContentGroup
            description="Performance context and risks the client should understand."
            title="Performance context"
          >
            <ReportSection title="Results">{report.results}</ReportSection>
            <ReportSection title="Problems / blockers">{report.problems}</ReportSection>
          </ReportContentGroup>
          <ReportContentGroup
            description="What happens next and what the agency needs from the client."
            title="Next steps"
          >
            <ReportSection title="Next actions">{report.nextActions}</ReportSection>
            <ReportSection title="Needed from client">{report.clientDecisionsNeeded}</ReportSection>
          </ReportContentGroup>
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
            <CardTitle className="text-ui">Latest monthly summary</CardTitle>
            <CardDescription className="mt-1">{formatPeriod(report)}</CardDescription>
          </div>
          <StatusBadge meta={report.statusMeta} />
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <h3 className="font-semibold text-text-primary">{report.title}</h3>
        {report.summary ? (
          <p className="mt-2 line-clamp-4 text-body text-text-secondary">{report.summary}</p>
        ) : (
          <p className="mt-2 text-ui text-text-muted">No executive summary was added.</p>
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

function ReportLinkBadge({ href, iconName, label }) {
  if (!href) {
    return null
  }

  return (
    <a
      className="inline-flex h-7 items-center gap-1 rounded-control border border-control-border bg-block px-2 text-label font-medium text-text-secondary no-underline transition-colors hover:bg-control-hover hover:text-text-primary"
      href={href}
      onClick={(event) => event.stopPropagation()}
      rel="noreferrer"
      target="_blank"
    >
      <Icon name={iconName} size={13} />
      {label}
    </a>
  )
}

function ReportArchiveItem({ clientId, isSelected, report }) {
  return (
    <article
      className={isSelected
        ? 'rounded-block border border-brand bg-action-muted p-4 text-ui shadow-none'
        : 'rounded-block border border-control-border bg-block p-4 text-ui transition-colors hover:bg-surface-subtle'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            aria-current={isSelected ? 'page' : undefined}
            className="line-clamp-2 font-semibold text-text-primary no-underline hover:text-action"
            to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}
          >
            {report.title}
          </Link>
          <p className="mt-1 text-label font-normal text-text-muted">{formatPeriod(report)}</p>
        </div>
        <StatusBadge meta={report.statusMeta} />
      </div>

      {report.summary ? (
        <p className="mt-3 line-clamp-3 text-label font-normal text-text-secondary">{report.summary}</p>
      ) : (
        <p className="mt-3 rounded-control bg-control px-3 py-2 text-label font-normal text-text-muted">
          No summary preview available.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!report.isClientVisible ? (
          <Badge className="border-warning/20 bg-warning/10 text-warning-foreground" variant="outline">
            Hidden from client
          </Badge>
        ) : null}
        <Link
          className="inline-flex h-7 items-center gap-1 rounded-control bg-action px-2 text-label font-medium text-action-foreground no-underline transition-colors hover:bg-action-hover"
          to={`/client/reports?clientId=${clientId}&reportId=${report.id}`}
        >
          Read
          <Icon name="arrowUpRight" size={12} />
        </Link>
        <ReportLinkBadge href={report.dashboardUrl} iconName="layoutDashboard" label="Dashboard" />
        <ReportLinkBadge href={report.pdfUrl} iconName="fileText" label="PDF" />
      </div>
    </article>
  )
}

function EmptyFilteredArchiveState({ onReset }) {
  return (
    <div className="rounded-block border border-dashed border-control-border bg-block-subtle p-4">
      <EmptyState
        action={(
          <Button onClick={onReset} size="sm" type="button" variant="outline">
            Clear filters
          </Button>
        )}
        className="bg-transparent p-0"
        description="Try a different search term, year, or report status."
        iconName="search"
        title="No reports match these filters"
      />
    </div>
  )
}

function ReportArchiveFilters({
  filters,
  onReset,
  onUpdateFilter,
  reportYears,
  resultCount,
  statuses,
  totalCount,
}) {
  const hasActiveFilters = Boolean(
    filters.search
    || filters.status !== REPORT_ARCHIVE_FILTER_ALL
    || filters.year !== REPORT_ARCHIVE_FILTER_ALL,
  )

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-quaternary" name="search" size={15} />
        <Input
          aria-label="Search reports"
          className="pl-9"
          onChange={(event) => onUpdateFilter('search', event.target.value)}
          placeholder="Search reports..."
          value={filters.search}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <Select onValueChange={(value) => onUpdateFilter('year', value)} value={filters.year}>
          <SelectTrigger aria-label="Report year">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={REPORT_ARCHIVE_FILTER_ALL}>All years</SelectItem>
            {reportYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onUpdateFilter('status', value)} value={filters.status}>
          <SelectTrigger aria-label="Report status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={REPORT_ARCHIVE_FILTER_ALL}>All statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 text-label font-normal text-text-muted">
        <span>{resultCount} of {totalCount}</span>
        <Button disabled={!hasActiveFilters} onClick={onReset} size="sm" type="button" variant="ghost">
          Reset
        </Button>
      </div>
    </div>
  )
}

function ReportArchiveList({
  clientId,
  filters,
  onReset,
  onUpdateFilter,
  reportYears,
  reports,
  selectedReport,
  statuses,
  totalCount,
}) {
  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardHeader className="border-b border-separator bg-surface-subtle">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-ui">Report archive</CardTitle>
            <CardDescription className="mt-1">Newest reporting periods first.</CardDescription>
          </div>
          <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
            {reports.length}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <ReportArchiveFilters
          filters={filters}
          onReset={onReset}
          onUpdateFilter={onUpdateFilter}
          reportYears={reportYears}
          resultCount={reports.length}
          statuses={statuses}
          totalCount={totalCount}
        />

        {reports.length > 0 ? (
          <div className="grid gap-3" data-testid="report-archive-list">
            {reports.map((report) => {
              const isSelected = selectedReport?.id === report.id

              return (
                <ReportArchiveItem
                  clientId={clientId}
                  isSelected={isSelected}
                  key={report.id}
                  report={report}
                />
              )
            })}
          </div>
        ) : (
          <EmptyFilteredArchiveState onReset={onReset} />
        )}
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
  const [archiveFilters, setArchiveFilters] = useState({
    search: '',
    status: REPORT_ARCHIVE_FILTER_ALL,
    year: REPORT_ARCHIVE_FILTER_ALL,
  })
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientReportsPage({
    clientId,
    reportId: routeParams.reportId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
  const selectedReportId = page.selectedReport?.id ?? ''
  const reportYears = useMemo(() => {
    if (page.status !== 'ready') {
      return []
    }

    return [...new Set(page.reports.map(getReportYear).filter(Boolean))]
  }, [page.reports, page.status])
  const archiveStatuses = useMemo(() => {
    if (page.status !== 'ready') {
      return []
    }

    const statusByValue = new Map()

    page.reports.forEach((report) => {
      statusByValue.set(report.status, {
        label: report.statusMeta?.label ?? report.status,
        value: report.status,
      })
    })

    return [...statusByValue.values()]
  }, [page.reports, page.status])
  const filteredReports = useMemo(() => {
    if (page.status !== 'ready') {
      return []
    }

    return filterReports(page.reports, archiveFilters)
  }, [archiveFilters, page.reports, page.status])

  function updateArchiveFilter(filterName, value) {
    setArchiveFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }))
  }

  function resetArchiveFilters() {
    setArchiveFilters({
      search: '',
      status: REPORT_ARCHIVE_FILTER_ALL,
      year: REPORT_ARCHIVE_FILTER_ALL,
    })
  }

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
        <div className="grid gap-4">
          <PreviewOnlyNotice report={page.selectedReport} />
          <ReportReader report={page.selectedReport} />
        </div>
      ) : (
        <ReportUnavailableState clientId={clientId} latestReport={page.latestReport} />
      )}
      <aside className="grid content-start gap-4">
        <LatestReportSummary clientId={clientId} report={page.latestReport} selectedReport={page.selectedReport} />
        <ReportArchiveList
          clientId={clientId}
          filters={archiveFilters}
          onReset={resetArchiveFilters}
          onUpdateFilter={updateArchiveFilter}
          reportYears={reportYears}
          reports={filteredReports}
          selectedReport={page.selectedReport}
          statuses={archiveStatuses}
          totalCount={page.reports.length}
        />
      </aside>
    </div>
  )
}
