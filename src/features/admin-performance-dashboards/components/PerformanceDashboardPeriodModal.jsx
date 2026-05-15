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

import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODES,
  PERFORMANCE_DATA_MODE_META,
} from '../../../entities/performance-dashboard'
import { Icon } from '../../../shared/icons'

function FormSection({ children, description, iconName, title }) {
  return (
    <section className="rounded-block border border-control-border bg-block shadow-none">
      <div className="border-b border-separator bg-surface-subtle px-card py-component">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-control text-text-quaternary">
            <Icon name={iconName} size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid gap-component p-card">{children}</div>
    </section>
  )
}

export function PerformanceDashboardPeriodModal({
  clients,
  error,
  form,
  isOpen,
  mode = 'create',
  onClose,
  onSubmit,
  onUpdateField,
}) {
  const title = mode === 'edit' ? 'Edit performance dashboard' : 'Create performance dashboard'
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
                Manage one reporting-period analytics dashboard. Draft and ready periods stay hidden from client users.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                  Create a client workspace before adding performance dashboards.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <FormSection
                description="Define ownership, reporting period, visibility status, and data trust metadata."
                iconName="layoutDashboard"
                title="Dashboard setup"
              >
                <div className="grid gap-2">
                  <Label htmlFor="performance-client">Client *</Label>
                  <Select
                    disabled={mode === 'edit' || !hasClients}
                    onValueChange={(value) => onUpdateField('clientId', value)}
                    value={form.clientId}
                  >
                    <SelectTrigger id="performance-client">
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
                  <Label htmlFor="performance-title">Dashboard title *</Label>
                  <Input
                    id="performance-title"
                    onChange={(event) => onUpdateField('title', event.target.value)}
                    placeholder="April 2026 Marketing Performance"
                    required
                    value={form.title}
                  />
                </div>

                <div className="grid gap-3 lg:grid-cols-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="performance-period-start">Period start *</Label>
                    <Input
                      id="performance-period-start"
                      onChange={(event) => onUpdateField('periodStart', event.target.value)}
                      required
                      type="date"
                      value={form.periodStart}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="performance-period-end">Period end *</Label>
                    <Input
                      id="performance-period-end"
                      onChange={(event) => onUpdateField('periodEnd', event.target.value)}
                      required
                      type="date"
                      value={form.periodEnd}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="performance-status">Status *</Label>
                    <Select onValueChange={(value) => onUpdateField('status', value)} value={form.status}>
                      <SelectTrigger id="performance-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PERFORMANCE_DASHBOARD_STATUSES).map((status) => (
                          <SelectItem key={status} value={status}>
                            {PERFORMANCE_DASHBOARD_STATUS_META[status]?.label ?? status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="performance-last-updated">Last updated *</Label>
                    <Input
                      id="performance-last-updated"
                      onChange={(event) => onUpdateField('lastUpdatedAt', event.target.value)}
                      required
                      type="datetime-local"
                      value={form.lastUpdatedAt?.slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="performance-data-mode">Data mode *</Label>
                    <Select onValueChange={(value) => onUpdateField('dataMode', value)} value={form.dataMode}>
                      <SelectTrigger id="performance-data-mode">
                        <SelectValue placeholder="Data mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PERFORMANCE_DATA_MODES).map((modeValue) => (
                          <SelectItem key={modeValue} value={modeValue}>
                            {PERFORMANCE_DATA_MODE_META[modeValue]?.label ?? modeValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="performance-data-confidence">Data confidence *</Label>
                    <Select
                      onValueChange={(value) => onUpdateField('dataConfidence', value)}
                      value={form.dataConfidence}
                    >
                      <SelectTrigger id="performance-data-confidence">
                        <SelectValue placeholder="Data confidence" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PERFORMANCE_DATA_CONFIDENCE).map((confidence) => (
                          <SelectItem key={confidence} value={confidence}>
                            {PERFORMANCE_DATA_CONFIDENCE_META[confidence]?.label ?? confidence}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormSection>

              <FormSection
                description="These fields build trust in the client view: who owns the period, where the data came from, and how attribution should be read."
                iconName="shieldCheck"
                title="Trust metadata"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="performance-account-manager">Account manager</Label>
                    <Input
                      id="performance-account-manager"
                      onChange={(event) => onUpdateField('accountManager', event.target.value)}
                      placeholder="Sarah Johnson"
                      value={form.accountManager}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="performance-agency-contact">Agency contact</Label>
                    <Input
                      id="performance-agency-contact"
                      onChange={(event) => onUpdateField('agencyContact', event.target.value)}
                      placeholder="sarah@agency.com"
                      value={form.agencyContact}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="performance-source-summary">Source summary</Label>
                  <Input
                    id="performance-source-summary"
                    onChange={(event) => onUpdateField('sourceSummary', event.target.value)}
                    placeholder="Manual import from GA4, Google Ads, and CRM export."
                    value={form.sourceSummary}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="performance-attribution-note">Attribution note</Label>
                  <Textarea
                    id="performance-attribution-note"
                    onChange={(event) => onUpdateField('attributionNote', event.target.value)}
                    placeholder="Last-click attribution via GA4 with CRM revenue matched manually."
                    rows={3}
                    value={form.attributionNote}
                  />
                </div>
              </FormSection>

              <FormSection
                description="Temporary professional input surface for manual or imported dashboard content. The richer editor will be built on top of this schema."
                iconName="code"
                title="Dashboard content JSON"
              >
                <div className="grid gap-2">
                  <Label htmlFor="performance-content-json">Content JSON *</Label>
                  <Textarea
                    className="min-h-80 font-mono text-xs leading-5"
                    id="performance-content-json"
                    onChange={(event) => onUpdateField('contentJson', event.target.value)}
                    required
                    spellCheck={false}
                    value={form.contentJson}
                  />
                </div>
              </FormSection>
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!hasClients} type="submit">
              <Icon name="checkCircle2" size={15} />
              {mode === 'edit' ? 'Save dashboard' : 'Create dashboard'}
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
