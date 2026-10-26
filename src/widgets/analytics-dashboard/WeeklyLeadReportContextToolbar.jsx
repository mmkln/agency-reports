import { Icon } from '@/shared/icons'
import {
  Button,
  ContentToolbar,
  Input,
  NativeSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

const refreshStatusLabel = {
  completed: 'Updated',
  completed_with_warnings: 'Updated with warnings',
  failed: 'Failed',
  pending: 'Waiting',
  queued: 'Queued',
  running: 'Updating',
  skipped: 'Skipped',
}

const refreshStatusClass = {
  completed: 'text-success',
  completed_with_warnings: 'text-warning-foreground',
  failed: 'text-destructive',
  pending: 'text-text-quaternary',
  queued: 'text-premium-blue',
  running: 'text-premium-blue',
  skipped: 'text-text-muted',
}

function formatPeriodDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatPeriodRange(period) {
  const start = formatPeriodDate(period?.start)
  const end = formatPeriodDate(period?.end)

  if (!start || !end) {
    return 'Choose reporting period'
  }

  return `${start} – ${end}`
}

function formatUpdatedAt(value) {
  if (!value) {
    return 'Data update pending'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Data update pending'
  }

  return `Data updated ${date.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
}

function ReportingPeriodControl({ onPeriodEndChange, onPeriodTypeChange, period, periodEnd, periodType }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Change reporting period"
          className="-mx-item mt-tag h-8 w-fit px-item text-label font-medium text-text-muted"
          size="sm"
          type="button"
          variant="ghost"
        >
          {formatPeriodRange(period)}
          <Icon className="text-text-quaternary" name="chevronDown" size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="text-ui font-semibold text-text-primary">Reporting period</p>
        <div className="mt-component grid gap-control">
          <label className="grid gap-micro text-label font-medium text-text-muted">
            Range
            <NativeSelect value={periodType} onChange={(event) => onPeriodTypeChange(event.target.value)}>
              <option value="week">Week</option>
              <option value="month_to_date">Month to date</option>
              <option value="year_to_date">Year to date</option>
            </NativeSelect>
          </label>
          <label className="grid gap-micro text-label font-medium text-text-muted">
            Period ending
            <Input type="date" value={periodEnd} onChange={(event) => onPeriodEndChange(event.target.value)} />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RefreshStepStatus({ step }) {
  const status = step.status || 'pending'
  const label = refreshStatusLabel[status] ?? status
  const toneClass = refreshStatusClass[status] ?? 'text-text-muted'

  return (
    <li className="flex items-start justify-between gap-component">
      <span className="min-w-0">
        <span className="block truncate text-label font-medium text-text-secondary">
          {step.label || step.key}
        </span>
        {step.error_message ? (
          <span className="mt-1 block text-caption font-normal leading-snug text-text-muted">
            {step.error_message}
          </span>
        ) : null}
      </span>
      <span className={`shrink-0 text-label font-semibold ${toneClass}`}>{label}</span>
    </li>
  )
}

function AnalyticsRefreshControl({ isRefreshing, onRefresh, refresh, refreshError }) {
  const steps = refresh?.steps ?? []
  const buttonLabel = isRefreshing ? 'Updating' : refresh?.status === 'failed' ? 'Retry' : 'Refresh'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-8 rounded-control px-3 text-label"
          onClick={isRefreshing ? undefined : onRefresh}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Icon name={isRefreshing ? 'clock' : 'refreshCw'} size={14} />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div>
          <p className="text-ui font-semibold text-text-primary">
            {isRefreshing ? 'Updating Lead Report' : 'Data refresh'}
          </p>
          <p className="mt-tag text-label font-normal text-text-muted">
            Source data sync and dashboard calculation run on the backend.
          </p>
        </div>

        {steps.length ? (
          <ul className="mt-component grid gap-control">
            {steps.map((step) => <RefreshStepStatus key={step.key || step.id} step={step} />)}
          </ul>
        ) : (
          <p className="mt-component rounded-control bg-fill-secondary px-control py-item text-label text-text-muted">
            No refresh has been run in this session.
          </p>
        )}

        {refreshError ? (
          <p className="mt-control rounded-control bg-destructive/10 px-control py-item text-label font-medium text-destructive">
            {refreshError}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function WeeklyLeadReportContextToolbar({
  calculatedAt,
  isRefreshing,
  onPeriodEndChange,
  onPeriodTypeChange,
  onRefresh,
  period,
  periodEnd,
  periodType,
  refresh,
  refreshError,
  settingsAction,
  title,
}) {
  return (
    <ContentToolbar className="rounded-none bg-transparent p-0 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h2 className="text-body font-semibold text-text-primary">{title}</h2>
        <ReportingPeriodControl
          onPeriodEndChange={onPeriodEndChange}
          onPeriodTypeChange={onPeriodTypeChange}
          period={period}
          periodEnd={periodEnd}
          periodType={periodType}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-control">
        <p className="text-label font-medium text-text-muted">{formatUpdatedAt(calculatedAt)}</p>
        {settingsAction}
        <AnalyticsRefreshControl
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          refresh={refresh}
          refreshError={refreshError}
        />
      </div>
    </ContentToolbar>
  )
}
