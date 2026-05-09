import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { Icon } from '../../../shared/icons'
import { AccessDeniedState } from '../../../widgets/client-overview'

const dashboardStatusClasses = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  unavailable: 'border-amber-200 bg-amber-50 text-amber-700',
}

function formatPeriod(report) {
  if (!report) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${formatter.format(new Date(report.periodStart))} - ${formatter.format(new Date(report.periodEnd))}`
}

function NoDashboardState() {
  return (
    <Card className="border-dashed border-slate-300 bg-white shadow-xs">
      <CardContent className="py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200">
            <Icon name="layoutDashboard" size={28} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-heading">Dashboard is being prepared</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The agency team has not published a client-visible marketing dashboard yet.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardUnavailableState({ dashboard }) {
  return (
    <Card className="border-amber-200 bg-amber-50/60 shadow-xs">
      <CardContent className="py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
              <Icon name="warning" size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-amber-950">Dashboard is temporarily unavailable</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800">
                {dashboard.fallbackMessage || 'Dashboard access needs to be updated. Please contact your agency manager.'}
              </p>
            </div>
          </div>
          {dashboard.publicUrl ? (
            <Button asChild variant="outline">
              <a href={dashboard.publicUrl} rel="noreferrer" target="_blank">
                Open full dashboard
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function EmbeddedDashboard({ dashboard }) {
  if (!dashboard.embedUrl) {
    return (
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="py-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold text-heading">Embedded view is not available</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This dashboard is available as an external link. Open the full dashboard to view current results.
            </p>
            {dashboard.publicUrl ? (
              <Button asChild className="mt-5">
                <a href={dashboard.publicUrl} rel="noreferrer" target="_blank">
                  Open full dashboard
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle>{dashboard.name}</CardTitle>
        <CardDescription>
          External dashboard embed. The source data is maintained in the reporting provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <iframe
          className="h-[680px] w-full bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={dashboard.embedUrl}
          title={dashboard.name}
        />
      </CardContent>
    </Card>
  )
}

function LatestSummaryCallout({ clientId, report }) {
  if (!report) {
    return (
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="py-5 text-sm text-slate-500">
          No monthly summary has been published yet. The report will appear here after the agency publishes it.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base">Latest monthly summary</CardTitle>
        <CardDescription>{formatPeriod(report)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-5">
        <p className="text-sm leading-6 text-slate-600">{report.summary}</p>
        <Button asChild variant="outline">
          <a href={`#client-reports?clientId=${clientId}&reportId=${report.id}`}>
            Read report
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

export function ClientDashboardPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientDashboardPage({
    clientId,
    dashboardId: routeParams.dashboardId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  if (!page.dashboard) {
    return <NoDashboardState />
  }

  return (
    <div className="grid gap-6">
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-heading">{page.dashboard.name}</h2>
              <Badge
                className={dashboardStatusClasses[page.dashboard.status] ?? 'border-slate-200 bg-slate-100 text-slate-600'}
                variant="outline"
              >
                {page.dashboard.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dashboard numbers are produced by the external reporting provider.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={`#client-reports?clientId=${clientId}`}>
                Latest summary
              </a>
            </Button>
            {page.dashboard.publicUrl ? (
              <Button asChild>
                <a href={page.dashboard.publicUrl} rel="noreferrer" target="_blank">
                  Open full dashboard
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!page.dashboard.isAvailable ? (
        <DashboardUnavailableState dashboard={page.dashboard} />
      ) : (
        <EmbeddedDashboard dashboard={page.dashboard} />
      )}

      <LatestSummaryCallout clientId={clientId} report={page.latestReport} />
    </div>
  )
}
