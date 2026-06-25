import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

function getItems(drilldown) {
  return Array.isArray(drilldown?.data?.items) ? drilldown.data.items : []
}

function getCount(drilldown, items) {
  const count = Number(drilldown?.data?.stage?.count)
  return Number.isFinite(count) ? count : items.length
}

function getValueBreakdown(drilldown) {
  return drilldown?.data?.value_breakdown ?? null
}

function formatCurrency(value, currency = 'USD') {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    style: 'currency',
  }).format(amount)
}

function getSummaryValue(breakdown, key) {
  return breakdown?.summary?.[key] ?? '0.00'
}

function PatientSkeletonRows() {
  return (
    <ul className="mt-control grid gap-1">
      {[0, 1, 2].map((item) => (
        <li className="flex items-center justify-between gap-component py-2" key={item}>
          <span className="h-3 w-32 rounded-full bg-fill-secondary" />
          <span className="h-3 w-14 rounded-full bg-fill-secondary" />
        </li>
      ))}
    </ul>
  )
}

function ValueSummary({ breakdown }) {
  if (!breakdown?.summary) {
    return null
  }

  const expectedValue = getSummaryValue(breakdown, 'expected_value')
  const pendingProcedureFee = getSummaryValue(breakdown, 'pending_procedure_total_fee')
  const lifetimeValue = getSummaryValue(breakdown, 'lifetime_value')

  return (
    <div className="mt-component">
      <div className="rounded-control bg-fill-secondary px-control py-item">
        <p className="text-caption font-medium text-text-muted">
          Expected value
        </p>
        <p className="mt-1 text-title font-semibold tabular-nums text-text-primary">
          {formatCurrency(expectedValue, breakdown.currency)}
        </p>
      </div>

      <dl className="mt-control grid gap-1.5">
        <div className="flex items-center justify-between gap-component">
          <dt className="text-caption font-medium text-text-muted">
            Pending procedure fee
          </dt>
          <dd className="shrink-0 text-label font-semibold tabular-nums text-text-primary">
            {formatCurrency(pendingProcedureFee, breakdown.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-component">
          <dt className="text-caption font-medium text-text-muted">
            Lifetime value
          </dt>
          <dd className="shrink-0 text-label font-semibold tabular-nums text-text-primary">
            {formatCurrency(lifetimeValue, breakdown.currency)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function PatientRow({ item }) {
  const track = item.track_label || (item.track ? `Track ${item.track}` : '')

  return (
    <li className="flex items-center justify-between gap-component py-2">
      <span className="min-w-0 truncate text-label font-medium text-text-primary">
        {item.contact_name || 'Unnamed patient'}
      </span>
      {track ? (
        <span className="shrink-0 rounded-full bg-fill-secondary px-2 py-0.5 text-caption font-medium text-text-muted">
          {track}
        </span>
      ) : null}
    </li>
  )
}

export function AcceptedTreatmentPopover({
  children,
  drilldown,
}) {
  const hasLoaded = Boolean(drilldown?.data)
  const isLoading = Boolean(drilldown?.isLoading)
  const hasError = Boolean(drilldown?.error)
  const items = hasLoaded ? getItems(drilldown) : []
  const breakdown = hasLoaded ? getValueBreakdown(drilldown) : null
  const count = hasLoaded ? getCount(drilldown, items) : null
  const visibleItems = items.slice(0, 10)
  const hiddenCount = Math.max(0, items.length - visibleItems.length)
  const countLabel = count === 1 ? '1 patient' : `${Number(count || 0).toLocaleString('en-US')} patients`
  const isPending = isLoading || !hasLoaded

  const handleOpenChange = (open) => {
    if (open) {
      drilldown?.load?.()
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div>
          <p className="text-ui font-semibold text-text-primary">
            Accepted treatment
          </p>
          <p className="mt-tag text-label text-text-muted">
            {isPending ? 'Loading patients...' : countLabel}
          </p>
        </div>

        {isPending ? (
          <PatientSkeletonRows />
        ) : null}

        {hasLoaded && !isLoading && !hasError ? (
          <ValueSummary breakdown={breakdown} />
        ) : null}

        {!isLoading && hasError ? (
          <p className="mt-component rounded-control bg-destructive/10 px-control py-item text-label font-medium text-destructive">
            Could not load details.
          </p>
        ) : null}

        {hasLoaded && !isLoading && !hasError && !items.length ? (
          <p className="mt-component rounded-control bg-fill-secondary px-control py-item text-label text-text-muted">
            No patients found.
          </p>
        ) : null}

        {hasLoaded && !isLoading && visibleItems.length ? (
          <>
            <p className="mt-component text-caption font-semibold text-text-muted">
              Patients
            </p>
            <ul className="mt-control max-h-72 overflow-y-auto divide-y divide-separator">
              {visibleItems.map((item) => (
                <PatientRow item={item} key={item.id || item.opportunity_id} />
              ))}
            </ul>
          </>
        ) : null}

        {hasLoaded && hiddenCount ? (
          <p className="mt-control text-caption text-text-muted">
            +{hiddenCount.toLocaleString('en-US')} more
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
