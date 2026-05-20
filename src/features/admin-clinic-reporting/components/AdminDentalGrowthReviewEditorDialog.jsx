import { useState } from 'react'

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

import {
  ContextFields,
  DataSourceFields,
  DecisionFields,
  HeroMetricFields,
  NarrativeFields,
  PeriodFields,
} from './AdminDentalGrowthReviewEditorSections'

function clonePeriod(period) {
  return period ? JSON.parse(JSON.stringify(period)) : null
}

function createEditorUpdater(setDraft) {
  return function updateDraft(mutator) {
    setDraft((current) => {
      const next = clonePeriod(current)
      mutator(next)
      return next
    })
  }
}

export function AdminDentalGrowthReviewEditorDialog({
  error,
  isOpen,
  onClose,
  onSave,
  period,
}) {
  const [draft, setDraft] = useState(() => clonePeriod(period))
  const updateDraft = createEditorUpdater(setDraft)

  if (!draft) {
    return null
  }

  return (
    <Dialog onOpenChange={(open) => { if (!open) onClose() }} open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-modal-xl overflow-hidden">
        <DialogHeader className="gap-tag">
          <div className="flex flex-wrap items-center gap-tag">
            <DialogTitle>Edit Dental Growth Review Draft</DialogTitle>
            <Badge tone="amber">Draft only</Badge>
          </div>
          <DialogDescription>
            {draft.label} | Publish explicitly when this operating review is ready for the client dashboard.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid max-h-[calc(90vh-180px)] gap-control overflow-y-auto pr-control"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(draft)
          }}
        >
          <PeriodFields draft={draft} updateDraft={updateDraft} />
          <ContextFields draft={draft} updateDraft={updateDraft} />
          <HeroMetricFields draft={draft} updateDraft={updateDraft} />
          <NarrativeFields draft={draft} updateDraft={updateDraft} />
          <DecisionFields draft={draft} updateDraft={updateDraft} />
          <DataSourceFields draft={draft} updateDraft={updateDraft} />
          {error ? <p className="rounded-control bg-danger-muted p-control text-ui text-danger">{error}</p> : null}
          <DialogFooter className="sticky bottom-0 items-center bg-material-vibrant py-control">
            <p className="mr-auto text-label font-normal text-text-muted">
              Saving does not update the client dashboard until publish.
            </p>
            <Button onClick={onClose} type="button" variant="ghost">Cancel</Button>
            <Button type="submit">Save draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
