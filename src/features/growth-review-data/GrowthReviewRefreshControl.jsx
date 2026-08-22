import { Icon } from '@/shared/icons'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

const refreshStatusLabel = {
  already_running: 'Already running',
  completed: 'Updated',
  failed: 'Failed',
  idle: 'Ready',
  pending: 'Waiting',
  queued: 'Queued',
  running: 'Updating',
  skipped: 'Skipped',
  sync_already_running: 'Already running',
}

const refreshStatusClass = {
  already_running: 'text-premium-blue',
  completed: 'text-success',
  failed: 'text-destructive',
  pending: 'text-text-quaternary',
  queued: 'text-premium-blue',
  running: 'text-premium-blue',
  skipped: 'text-text-muted',
  sync_already_running: 'text-premium-blue',
}

function getRefreshButtonLabel(refresh) {
  if (refresh?.isRefreshing) {
    return 'Updating'
  }

  if (refresh?.status === 'failed') {
    return 'Retry'
  }

  return 'Refresh'
}

function RefreshStepStatus({ step }) {
  const status = step.status || 'pending'
  const label = refreshStatusLabel[status] ?? status
  const toneClass = refreshStatusClass[status] ?? 'text-text-muted'
  const detail = step.detail || step.errorMessage || ''

  return (
    <li className="flex items-start justify-between gap-component">
      <span className="min-w-0">
        <span className="block truncate text-label font-medium text-text-secondary">
          {step.label}
        </span>
        {detail ? (
          <span className="mt-1 block text-caption font-normal leading-snug text-text-muted">
            {detail}
          </span>
        ) : null}
      </span>
      <span className={`shrink-0 text-label font-semibold ${toneClass}`}>
        {label}
      </span>
    </li>
  )
}

export function GrowthReviewRefreshControl({ refresh }) {
  const steps = refresh?.refreshRun?.steps ?? []
  const hasSteps = steps.length > 0
  const isRefreshing = refresh?.isRefreshing

  if (!refresh) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-8 rounded-control px-3 text-label"
          onClick={refresh.startRefresh}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Icon name={isRefreshing ? 'clock' : 'refreshCw'} size={14} />
          {getRefreshButtonLabel(refresh)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div>
          <p className="text-ui font-semibold text-text-primary">
            {isRefreshing ? 'Updating Growth Review' : 'Data refresh'}
          </p>
          <p className="mt-tag text-label font-normal text-text-muted">
            Source data sync and dashboard calculation run on the backend.
          </p>
        </div>

        {hasSteps ? (
          <ul className="mt-component grid gap-control">
            {steps.map((step) => (
              <RefreshStepStatus key={step.key || step.id} step={step} />
            ))}
          </ul>
        ) : (
          <p className="mt-component rounded-control bg-fill-secondary px-control py-item text-label text-text-muted">
            No refresh has been run in this session.
          </p>
        )}

        {refresh.error ? (
          <p className="mt-control rounded-control bg-destructive/10 px-control py-item text-label font-medium text-destructive">
            {refresh.error}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
