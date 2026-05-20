import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  Textarea,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

function ImportIssue({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-control bg-destructive-muted px-3 py-2 text-ui text-destructive">
      {message}
    </div>
  )
}

function ImportWarnings({ warnings = [] }) {
  if (warnings.length === 0) {
    return null
  }

  return (
    <div className="grid gap-1 rounded-control bg-warning-muted px-3 py-2 text-ui text-warning-foreground">
      <p className="font-semibold text-warning-foreground">Import warnings</p>
      <ul className="grid gap-1">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  )
}

function ImportSummary({
  detailItems = [],
  emptyMessage,
  plan,
  summaryItems = [],
}) {
  if (!plan) {
    return (
      <div className="rounded-control bg-surface-subtle px-3 py-3 text-ui text-text-muted">
        {emptyMessage}
      </div>
    )
  }

  return (
    <section className="grid gap-component rounded-control bg-surface-subtle px-3 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
          <Icon name="checkCircle2" size={15} />
        </span>
        <div className="min-w-0">
          <h3 className="text-ui font-semibold text-text-primary">Import preview ready</h3>
          <p className="mt-1 text-label text-text-muted">
            Contract {plan.contractVersion}. Records will be added to this draft only and remain unpublished until saved and published.
          </p>
        </div>
      </div>

      {summaryItems.length > 0 ? (
        <dl className="grid gap-2 sm:grid-cols-3">
          {summaryItems.map(({ label, value }) => (
            <div className="rounded-control bg-block px-3 py-2" key={label}>
              <dt className="text-label text-text-muted">{label}</dt>
              <dd className="text-ui font-semibold text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {detailItems.length > 0 ? (
        <div className="grid gap-1 text-label text-text-muted">
          {detailItems.map(({ label, value }) => (
            <p key={label}>
              <span className="font-semibold text-text-secondary">{label}:</span>{' '}
              {value || 'None'}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function AdminClinicJsonImportDialog({
  description,
  detailItems,
  emptyPreviewMessage,
  headerControl,
  importError,
  importPlan,
  isOpen,
  onApply,
  onClose,
  onPreview,
  onRawJsonChange,
  rawJson,
  safetyDescription,
  safetyTitle,
  summaryItems,
  textareaId,
  textareaLabel,
  title,
}) {
  const canApplyImport = Boolean(importPlan) && importPlan.isValid !== false

  function submitPreview(event) {
    event.preventDefault()
    onPreview(rawJson)
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-xl gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={submitPreview}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-heading text-text-primary">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component">
              {headerControl ? (
                <section className="rounded-control bg-block px-3 py-3">
                  {headerControl}
                </section>
              ) : null}
              <ImportIssue message={importError} />
              <ImportWarnings warnings={importPlan?.warnings} />

              <div className="flex items-start gap-3 rounded-control bg-action-muted px-3 py-3 text-ui">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-action ring-1 ring-action/20">
                  <Icon name="shieldCheck" size={15} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">{safetyTitle}</p>
                  <p className="mt-1 text-body text-text-secondary">{safetyDescription}</p>
                </div>
              </div>

              <section className="rounded-block bg-block shadow-none">
                <div className="px-card py-component">
                  <div className="grid gap-2">
                    <Label htmlFor={textareaId}>{textareaLabel}</Label>
                    <Textarea
                      className="min-h-[24rem] font-mono text-label font-normal"
                      id={textareaId}
                      onChange={(event) => onRawJsonChange(event.target.value)}
                      required
                      spellCheck={false}
                      value={rawJson}
                    />
                  </div>
                </div>
              </section>

              <ImportSummary
                detailItems={detailItems}
                emptyMessage={emptyPreviewMessage}
                plan={importPlan}
                summaryItems={summaryItems}
              />
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="outline">
              <Icon name="fileJson" size={15} />
              Preview import
            </Button>
            <Button disabled={!canApplyImport} onClick={onApply} type="button">
              <Icon name="fileJson" size={15} />
              Apply to draft
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
