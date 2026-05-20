import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { ClinicReportTemplateSection } from './ClinicReportTemplateSection'
import {
  ClientNarrativeSection,
  InternalNotesSection,
  ReportSetupSection,
  SupportingLinksSection,
} from './ReportModalSections'

export function ReportModal({
  clients,
  error,
  form,
  isOpen,
  mode = 'create',
  onClose,
  onApplyClinicTemplate,
  onSubmit,
  onUpdateField,
}) {
  const title = mode === 'edit' ? 'Edit monthly report' : 'Create monthly report'
  const hasClients = clients.length > 0

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-xl gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={onSubmit}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-heading text-text-primary">{title}</DialogTitle>
              <DialogDescription>
                Write the portal-ready narrative for a reporting period. Draft and ready reports stay hidden.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-ui text-warning-foreground">
                  Create an account workspace before adding monthly reports.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
                  {error}
                </div>
              ) : null}

              <ReportSetupSection
                clients={clients}
                form={form}
                hasClients={hasClients}
                mode={mode}
                onUpdateField={onUpdateField}
              />
              <ClientNarrativeSection form={form} onUpdateField={onUpdateField} />
              <ClinicReportTemplateSection
                clients={clients}
                form={form}
                onApplyTemplate={onApplyClinicTemplate}
                onUpdateField={onUpdateField}
              />
              <SupportingLinksSection form={form} onUpdateField={onUpdateField} />
              <InternalNotesSection form={form} onUpdateField={onUpdateField} />
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!hasClients} type="submit">
              <Icon name="checkCircle2" size={15} />
              {mode === 'edit' ? 'Save report' : 'Create report'}
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
