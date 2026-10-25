import { useState } from 'react'

import { useAnalyticsDashboardReadModel } from '@/features/analytics-dashboard-data'
import { AnalyticsDashboardRenderer } from '@/widgets/analytics-dashboard'
import {
  Button,
  EmptyState,
  Input,
  NativeSelect,
  PageHeader,
  PageShell,
  ResourceState,
  Skeleton,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

const DASHBOARD_KEY = 'weekly-lead-report'

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultPeriodEnd() {
  const date = new Date()
  date.setDate(date.getDate() - date.getDay())
  return toIsoDate(date)
}

function formatDateRange(period) {
  const formatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  const start = formatter.format(new Date(`${period.start}T12:00:00`))
  const end = formatter.format(new Date(`${period.end}T12:00:00`))
  return `${start} - ${end}`
}

function formatFreshness(value) {
  if (!value) {
    return 'Not calculated yet'
  }
  return `Updated ${new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))}`
}

export function WeeklyLeadReportPage({ routeParams = {}, runtime }) {
  const workspaceId = routeParams.workspaceId ?? routeParams.clientId ?? runtime.defaultClientId ?? runtime.viewer?.activeWorkspaceId
  const [periodType, setPeriodType] = useState('week')
  const [periodEnd, setPeriodEnd] = useState(getDefaultPeriodEnd)
  const readModel = useAnalyticsDashboardReadModel({
    dashboardKey: DASHBOARD_KEY,
    periodEnd,
    periodType,
    runtime,
    workspaceId,
  })
  const periodLabel = readModel.dashboard?.period ? formatDateRange(readModel.dashboard.period) : ''

  if (readModel.status === 'loading') {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="min-h-96 w-full" />
      </PageShell>
    )
  }

  if (readModel.status === 'error') {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <ResourceState errorInfo={readModel.errorInfo} onRetry={readModel.reload} />
      </PageShell>
    )
  }

  const dashboard = readModel.dashboard

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <PageHeader
        actions={(
          <div className="flex w-full flex-wrap items-end gap-control lg:w-auto">
            <label className="grid min-w-40 gap-micro text-label text-text-muted">
              Reporting period
              <NativeSelect value={periodType} onChange={(event) => setPeriodType(event.target.value)}>
                <option value="week">Week</option>
                <option value="month_to_date">Month to date</option>
                <option value="year_to_date">Year to date</option>
              </NativeSelect>
            </label>
            <label className="grid min-w-40 gap-micro text-label text-text-muted">
              Period ending
              <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
            </label>
            <Button
              disabled={readModel.isRefreshing}
              icon={<Icon className={readModel.isRefreshing ? 'animate-spin' : ''} name="refreshCw" size={16} />}
              onClick={readModel.runRefresh}
              type="button"
              variant="secondary"
            >
              {readModel.isRefreshing ? 'Refreshing' : 'Refresh'}
            </Button>
          </div>
        )}
        eyebrow={periodLabel}
        title={dashboard.dashboard.title}
        variant="inline"
      />

      <div className="flex min-h-control flex-wrap items-center justify-between gap-control border-b border-separator pb-control text-label font-normal text-text-muted">
        <span>{formatFreshness(dashboard.calculatedAt)}</span>
        {readModel.isRefreshing ? <span>{readModel.refresh?.steps?.find((step) => step.status === 'running')?.label ?? 'Preparing data'}</span> : null}
        {readModel.refreshError ? <span className="text-destructive">{readModel.refreshError}</span> : null}
      </div>

      {dashboard.status === 'not_calculated' ? (
        <EmptyState
          action={(
            <Button disabled={readModel.isRefreshing} onClick={readModel.runRefresh} type="button">
              Calculate report
            </Button>
          )}
          description="Sync source data and calculate this reporting period."
          iconName="barChart"
          title="This report has not been calculated yet"
        />
      ) : (
        <AnalyticsDashboardRenderer widgets={dashboard.widgets} />
      )}
    </PageShell>
  )
}
