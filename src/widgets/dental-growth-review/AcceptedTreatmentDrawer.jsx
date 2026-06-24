import { Icon } from '@/shared/icons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui'

import { reactivationText } from './reactivationTypography'

function getItems(drilldown) {
  return Array.isArray(drilldown?.data?.items) ? drilldown.data.items : []
}

function getCount(drilldown, items) {
  const count = Number(drilldown?.data?.stage?.count)
  return Number.isFinite(count) ? count : items.length
}

function AcceptedTreatmentRow({ item }) {
  const meta = [
    item.track_label || (item.track ? `Track ${item.track}` : ''),
    item.pipeline_stage_name,
  ].filter(Boolean).join(' · ')

  return (
    <li className="rounded-block bg-block px-4 py-3 shadow-block">
      <div className="flex items-start justify-between gap-component">
        <div className="min-w-0">
          <p className="truncate text-ui font-semibold text-text-primary">
            {item.contact_name || 'Unnamed patient'}
          </p>
          {meta ? (
            <p className="mt-tag truncate text-label text-text-secondary" title={meta}>
              {meta}
            </p>
          ) : null}
        </div>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
          <Icon name="checkCircle2" size={14} />
        </span>
      </div>
      {item.opportunity_name ? (
        <p className="mt-control truncate text-caption text-text-muted" title={item.opportunity_name}>
          {item.opportunity_name}
        </p>
      ) : null}
    </li>
  )
}

function LoadingRows() {
  return (
    <ul className="grid gap-control">
      {[0, 1, 2].map((item) => (
        <li className="rounded-block bg-block px-4 py-3 shadow-block" key={item}>
          <div className="h-4 w-2/5 rounded-full bg-fill-secondary" />
          <div className="mt-control h-3 w-3/5 rounded-full bg-fill-secondary" />
        </li>
      ))}
    </ul>
  )
}

export function AcceptedTreatmentDrawer({
  drilldown,
  onOpenChange,
  open,
}) {
  const items = getItems(drilldown)
  const count = getCount(drilldown, items)
  const description = count === 1
    ? '1 patient matched the accepted treatment signal.'
    : `${count.toLocaleString('en-US')} patients matched the accepted treatment signal.`

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-[460px]">
        <SheetHeader>
          <SheetTitle>Accepted treatment</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-panel pb-panel">
          <div className="py-card">
            <p className={reactivationText.metricLabel}>
              Patients
            </p>

            {drilldown?.isLoading ? (
              <div className="mt-component">
                <LoadingRows />
              </div>
            ) : null}

            {!drilldown?.isLoading && drilldown?.error ? (
              <p className="mt-component rounded-block bg-destructive/10 px-4 py-3 text-label font-medium text-destructive">
                {drilldown.error}
              </p>
            ) : null}

            {!drilldown?.isLoading && !drilldown?.error && !items.length ? (
              <p className="mt-component rounded-block bg-fill-secondary px-4 py-3 text-label text-text-muted">
                No accepted treatment patients found for this campaign.
              </p>
            ) : null}

            {!drilldown?.isLoading && items.length ? (
              <ul className="mt-component grid gap-control">
                {items.map((item) => (
                  <AcceptedTreatmentRow item={item} key={item.id || item.opportunity_id} />
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
