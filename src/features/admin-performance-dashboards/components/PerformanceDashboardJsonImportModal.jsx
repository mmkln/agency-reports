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
import {
  createPerformanceDashboardExampleJson,
  PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES,
} from '../model'
import { IssueList } from './editor/AdminPerformanceDashboardEditorPrimitives'

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
  const [exampleType, setExampleType] = useState(PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES.PERFORMANCE_SUMMARY)
  const exampleJson = useMemo(
    () => createPerformanceDashboardExampleJson(exampleType, clientId),
    [clientId, exampleType],
  )
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
              <DialogTitle className="text-heading text-text-primary">Import performance dashboard JSON</DialogTitle>
              <DialogDescription>
                Paste a prepared dashboard period JSON. Valid imports are saved as draft only and must be reviewed before publishing.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component">
              {!hasClients ? (
                <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-ui text-warning-foreground">
                  Create an account workspace before importing performance data.
                </div>
              ) : null}

              <IssueList issues={importResult?.errors} title="Import blocked" tone="error" />
              <IssueList issues={importResult?.warnings} title="Imported with warnings" tone="warning" />

              <div className="flex items-start gap-3 rounded-control border border-action/20 bg-action-muted px-3 py-3 text-ui">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-action ring-1 ring-action/20">
                  <Icon name="code" size={15} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">JSON contract reference</p>
                  <p className="mt-1 text-body text-text-secondary">
                    Import accepts the UC-004 dashboard period contract, including `campaign_execution` and `agency_work`.
                    Valid imports always become drafts and still require review before publishing.
                  </p>
                  <p className="mt-2 break-all font-mono text-label font-normal text-text-muted">
                    docs/implementation/UC-004-json-import-contract.md
                  </p>
                </div>
              </div>

              <section className="rounded-block border border-control-border bg-block shadow-none">
                <div className="border-b border-separator bg-surface-subtle px-card py-component">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-control text-text-quaternary">
                      <Icon name="fileJson" size={16} />
                    </span>
                    <div>
                      <h3 className="text-ui text-text-primary">Import source</h3>
                      <p className="mt-1 text-label font-normal text-text-muted">
                        The selected account is applied to the imported dashboard, so the JSON cannot accidentally publish under a different workspace.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-component p-card">
                  <div className="grid gap-2">
                    <Label htmlFor="performance-import-client">Account *</Label>
                    <Select disabled={!hasClients} onValueChange={setClientId} value={clientId}>
                      <SelectTrigger id="performance-import-client">
                        <SelectValue placeholder="Select account" />
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
                    <Label htmlFor="performance-import-example">Example payload</Label>
                    <Select onValueChange={setExampleType} value={exampleType}>
                      <SelectTrigger id="performance-import-example">
                        <SelectValue placeholder="Select example" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES.PERFORMANCE_SUMMARY}>
                          Performance summary
                        </SelectItem>
                        <SelectItem value={PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES.CAMPAIGN_EXECUTION}>
                          Campaign execution
                        </SelectItem>
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
                      className="min-h-[28rem] font-mono text-label font-normal"
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
