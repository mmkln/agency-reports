import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getClientReportsPage } from '../../../domain/services/clientReportsService'
import { Icon } from '../../../shared/icons'
import { AccessDeniedState } from '../../../widgets/client-overview'

const reportStatusClasses = {
  archived: 'border-slate-200 bg-slate-100 text-slate-600',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

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
    <Card className="border-dashed border-slate-300 bg-white shadow-xs">
      <CardContent className="py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200">
            <Icon name="fileText" size={28} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-heading">No published report yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
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
    <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{children}</p>
    </section>
  )
}

function ReportReader({ report }) {
  if (!report) {
    return (
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="py-8 text-sm text-slate-500">
          This report is not available. Draft and ready reports are hidden from the client portal.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{report.title}</CardTitle>
            <CardDescription className="mt-1">{formatPeriod(report)}</CardDescription>
          </div>
          <Badge
            className={reportStatusClasses[report.status] ?? 'border-slate-200 bg-slate-100 text-slate-600'}
            variant="outline"
          >
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 py-5">
        <ReportSection title="Executive summary">{report.summary}</ReportSection>
        <div className="grid gap-4 lg:grid-cols-2">
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
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base">Report archive</CardTitle>
        <CardDescription>Published and archived reports, sorted by latest period first.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 py-4">
        {reports.map((report) => {
          const isSelected = selectedReport?.id === report.id

          return (
            <a
              className={isSelected
                ? 'rounded-xl border border-brand bg-indigo-50 px-4 py-3 text-sm shadow-xs'
                : 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-slate-50'}
              href={`#client-reports?clientId=${clientId}&reportId=${report.id}`}
              key={report.id}
            >
              <span className="block font-semibold text-slate-900">{report.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{formatPeriod(report)}</span>
            </a>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function ClientReportsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientReportsPage({
    clientId,
    reportId: routeParams.reportId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

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
