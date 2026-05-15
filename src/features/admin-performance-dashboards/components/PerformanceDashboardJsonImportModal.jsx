import { useMemo, useState } from 'react'

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
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

function createExampleJson(clientId) {
  return JSON.stringify({
    client_id: clientId || '00000000-0000-4000-8000-000000000000',
    title: 'June 2026 Marketing Performance',
    period_start: '2026-06-01',
    period_end: '2026-06-30',
    data_confidence: 'high',
    last_updated_at: '2026-07-01T09:00:00.000Z',
    attribution_note: 'Manual import from GA4, Google Ads, and CRM export.',
    source_summary: 'GA4, Google Ads, Meta Ads, CRM export',
    content: {
      executive_summary: {
        narrative: 'Marketing generated more qualified demand this period while cost per lead stayed within target.',
        main_win: 'Qualified leads increased from paid search.',
        main_issue: 'Meta lead quality still needs filtering.',
        next_focus: 'Shift budget toward higher-intent campaigns.',
      },
      hero_metric: {
        label: 'Qualified Leads',
        value: 81,
        unit: '',
        delta_pct: 18,
        goal_pct: 108,
        status: 'ahead',
        source: 'CRM export',
      },
      kpi_cards: [
        {
          id: 'qualified-leads',
          label: 'Qualified Leads',
          value: 81,
          delta_pct: 18,
          goal: 75,
          status: 'ahead',
          source: 'CRM export',
          definition: 'Sales-approved leads for this reporting period.',
        },
      ],
      goals: [
        {
          id: 'qualified-leads-goal',
          name: 'Qualified leads',
          target: 75,
          actual: 81,
          status: 'ahead',
          note: 'Ahead of monthly goal.',
        },
      ],
      channel_breakdown: [
        {
          id: 'google-ads',
          channel: 'google_ads',
          spend: 4200,
          qualified_leads: 45,
          cpl: 93.33,
          summary: 'Search campaigns produced the strongest lead quality.',
        },
      ],
      insights: [
        {
          id: 'search-quality',
          title: 'Search lead quality improved',
          body: 'Higher-intent keywords produced more booked consultations than broad Meta targeting.',
          severity: 'positive',
        },
      ],
      next_steps: [
        {
          id: 'budget-shift',
          title: 'Shift budget toward high-intent search',
          description: 'Move 15% of Meta prospecting budget into the best-performing search campaigns.',
          owner: 'Agency',
          due_date: '2026-07-08',
          priority: 'high',
        },
      ],
    },
  }, null, 2)
}

function IssueList({ issues, title, tone }) {
  if (!issues?.length) {
    return null
  }

  const toneClassName = tone === 'warning'
    ? 'border-warning/25 bg-warning/10 text-warning-foreground'
    : 'border-destructive/20 bg-destructive/10 text-destructive'

  return (
    <div className={`rounded-control border px-3 py-2 ${toneClassName}`}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 grid gap-1 text-xs leading-5">
        {issues.map((issue, index) => (
          <li key={`${issue.path}-${index}`}>
            <span className="font-mono">{issue.path}</span>: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PerformanceDashboardJsonImportModal({
  clients,
  defaultClientId,
  importResult,
  isOpen,
  onClose,
  onSubmit,
}) {
  const hasClients = clients.length > 0
  const [clientId, setClientId] = useState(defaultClientId)
  const exampleJson = useMemo(() => createExampleJson(clientId), [clientId])
  const [rawJson, setRawJson] = useState(exampleJson)

  function submitImport(event) {
    event.preventDefault()
    onSubmit({
      clientId,
      rawJson,
    })
  }

  function fillExample() {
    setRawJson(exampleJson)
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-xl gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={submitImport}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text-primary">Import performance dashboard JSON</DialogTitle>
              <DialogDescription>
                Paste a prepared dashboard period JSON. Valid imports are saved as draft only and must be reviewed before publishing.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                  Create a client workspace before importing performance data.
                </div>
              ) : null}

              <IssueList issues={importResult?.errors} title="Import blocked" />
              <IssueList issues={importResult?.warnings} title="Imported with warnings" tone="warning" />

              <section className="rounded-block border border-control-border bg-block shadow-none">
                <div className="border-b border-separator bg-surface-subtle px-card py-component">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-control text-text-quaternary">
                      <Icon name="fileJson" size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">Import source</h3>
                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        The selected client is applied to the imported dashboard, so the JSON cannot accidentally publish under a different workspace.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-component p-card">
                  <div className="grid gap-2">
                    <Label htmlFor="performance-import-client">Client *</Label>
                    <Select disabled={!hasClients} onValueChange={setClientId} value={clientId}>
                      <SelectTrigger id="performance-import-client">
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
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="performance-import-json">Dashboard JSON *</Label>
                      <Button onClick={fillExample} size="sm" type="button" variant="ghost">
                        Use example
                      </Button>
                    </div>
                    <Textarea
                      className="min-h-[28rem] font-mono text-xs leading-5"
                      id="performance-import-json"
                      onChange={(event) => setRawJson(event.target.value)}
                      required
                      spellCheck={false}
                      value={rawJson}
                    />
                  </div>
                </div>
              </section>
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={!hasClients} type="submit">
              <Icon name="fileJson" size={15} />
              Import as draft
            </Button>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
