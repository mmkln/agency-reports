import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { Icon } from '../../../shared/icons'

export function ReportModal({
  clients,
  error,
  form,
  isOpen,
  mode = 'create',
  onClose,
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
              <DialogTitle className="text-lg font-semibold text-text-primary">{title}</DialogTitle>
              <DialogDescription>
                Write the client-facing narrative for a reporting period. Draft and ready reports stay hidden.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                  Create a client workspace before adding monthly reports.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="report-client">Client *</Label>
                <Select
                  disabled={mode === 'edit' || !hasClients}
                  onValueChange={(value) => onUpdateField('clientId', value)}
                  value={form.clientId}
                >
                  <SelectTrigger id="report-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-title">Report title *</Label>
                <Input
                  id="report-title"
                  onChange={(event) => onUpdateField('title', event.target.value)}
                  placeholder="May 2026 Monthly Summary"
                  required
                  value={form.title}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="report-period-start">Period start *</Label>
                  <Input
                    id="report-period-start"
                    onChange={(event) => onUpdateField('periodStart', event.target.value)}
                    required
                    type="date"
                    value={form.periodStart}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-period-end">Period end *</Label>
                  <Input
                    id="report-period-end"
                    onChange={(event) => onUpdateField('periodEnd', event.target.value)}
                    required
                    type="date"
                    value={form.periodEnd}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-status">Status *</Label>
                  <Select onValueChange={(value) => onUpdateField('status', value)} value={form.status}>
                    <SelectTrigger id="report-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(REPORT_STATUSES).map((status) => (
                        <SelectItem key={status} value={status}>
                          {REPORT_STATUS_META[status]?.label ?? status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-summary">Executive summary</Label>
                <Textarea
                  id="report-summary"
                  onChange={(event) => onUpdateField('summary', event.target.value)}
                  placeholder="Short plain-language overview of the month."
                  rows={4}
                  value={form.summary}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="report-work">What we did</Label>
                  <Textarea
                    id="report-work"
                    onChange={(event) => onUpdateField('whatWeDid', event.target.value)}
                    placeholder="- Work item 1"
                    rows={5}
                    value={form.whatWeDid}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-results">Results</Label>
                  <Textarea
                    id="report-results"
                    onChange={(event) => onUpdateField('results', event.target.value)}
                    placeholder="Spend, leads, CPL, booked calls, conversion rate..."
                    rows={5}
                    value={form.results}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-wins">Wins</Label>
                  <Textarea
                    id="report-wins"
                    onChange={(event) => onUpdateField('wins', event.target.value)}
                    placeholder="- Win 1"
                    rows={5}
                    value={form.wins}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-problems">Problems / blockers</Label>
                  <Textarea
                    id="report-problems"
                    onChange={(event) => onUpdateField('problems', event.target.value)}
                    placeholder="- Problem 1"
                    rows={5}
                    value={form.problems}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-next-actions">Next actions</Label>
                  <Textarea
                    id="report-next-actions"
                    onChange={(event) => onUpdateField('nextActions', event.target.value)}
                    placeholder="- Action 1"
                    rows={5}
                    value={form.nextActions}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-client-decisions">Needed from client</Label>
                  <Textarea
                    id="report-client-decisions"
                    onChange={(event) => onUpdateField('clientDecisionsNeeded', event.target.value)}
                    placeholder="- Decision / approval / access needed"
                    rows={5}
                    value={form.clientDecisionsNeeded}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="report-dashboard-url">Dashboard URL</Label>
                  <Input
                    id="report-dashboard-url"
                    onChange={(event) => onUpdateField('dashboardUrl', event.target.value)}
                    placeholder="https://lookerstudio.google.com/reporting/..."
                    type="url"
                    value={form.dashboardUrl}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="report-pdf-url">PDF / full report URL</Label>
                  <Input
                    id="report-pdf-url"
                    onChange={(event) => onUpdateField('pdfUrl', event.target.value)}
                    placeholder="https://drive.google.com/..."
                    type="url"
                    value={form.pdfUrl}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-internal-notes">Internal notes</Label>
                <Textarea
                  id="report-internal-notes"
                  onChange={(event) => onUpdateField('internalNotes', event.target.value)}
                  placeholder="Internal context for the agency. Never shown to the client."
                  rows={3}
                  value={form.internalNotes}
                />
                <p className="text-xs leading-5 text-text-muted">
                  Internal notes are stored for agency context and are never visible in the client portal.
                </p>
              </div>
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
