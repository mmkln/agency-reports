import { useMemo, useRef, useState } from 'react'

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

import { Icon } from '../../../../shared/icons'
import { TASK_IMPORT_PARTIAL_POLICIES } from '../model/taskMarkdownImport'

const ACTION_TONE = Object.freeze({
  conflict: 'bg-destructive/10 text-destructive',
  create: 'bg-success-muted text-success-foreground',
  skip: 'bg-control text-text-muted',
  update: 'bg-action-muted text-action',
})

const PARTIAL_POLICY_LABEL = Object.freeze({
  [TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING]: 'Fill missing fields',
  [TASK_IMPORT_PARTIAL_POLICIES.SKIP_INCOMPLETE]: 'Skip incomplete rows',
})

function createExampleMarkdown() {
  return `# Website Launch Tasks

## To Do
- [ ] Confirm launch checklist
- [ ] Prepare analytics QA

## In Progress
- [ ] Review landing page copy

## Done
- [x] Create kickoff notes`
}

function WarningList({ warnings }) {
  if (!warnings?.length) {
    return null
  }

  return (
    <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
      <p className="font-semibold">Preview warnings</p>
      <ul className="mt-2 grid gap-1 text-xs leading-5">
        {warnings.map((warning, index) => (
          <li key={`${warning.message}-${index}`}>
            {warning.line ? <span className="font-mono">Line {warning.line}</span> : 'Import'}: {warning.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PlanCount({ count, label }) {
  return (
    <div className="rounded-control bg-control px-3 py-2">
      <dt className="text-label text-text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-text-primary">{count}</dd>
    </div>
  )
}

function ImportPlanPreview({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-control bg-control px-3 py-3 text-sm text-text-secondary">
        Generate a preview before creating tasks.
      </div>
    )
  }

  return (
    <section className="grid gap-component rounded-block bg-block p-card">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Import preview</h3>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <PlanCount count={plan.counts.create} label="Create" />
          <PlanCount count={plan.counts.update} label="Update" />
          <PlanCount count={plan.counts.skip} label="Skip" />
          <PlanCount count={plan.counts.conflict} label="Conflict" />
        </dl>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-control bg-surface-subtle">
        {plan.items.map((item, index) => (
          <div className="flex items-start gap-3 border-t border-separator px-3 py-2 first:border-t-0" key={`${item.type}-${item.label}-${index}`}>
            <span className={`mt-0.5 inline-flex h-control-mini min-w-16 items-center justify-center rounded-full px-2 text-[11px] font-semibold uppercase ${ACTION_TONE[item.action]}`}>
              {item.action}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                {item.sourceColumn ? `${item.sourceColumn}: ` : null}{item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TaskMarkdownImportModal({
  clients,
  defaultClientId,
  importError,
  importPlan,
  isOpen,
  onApply,
  onClose,
  onInvalidatePreview,
  onPreview,
  projects,
  saveState,
}) {
  const fileInputRef = useRef(null)
  const hasClients = clients.length > 0
  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || '')
  const [partialPolicy, setPartialPolicy] = useState(TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING)
  const [projectId, setProjectId] = useState('none')
  const [rawMarkdown, setRawMarkdown] = useState(createExampleMarkdown)
  const selectedClientProjects = useMemo(
    () => projects.filter((project) => project.client_id === clientId),
    [clientId, projects],
  )
  const canPreview = hasClients && clientId && rawMarkdown.trim().length > 0
  const canApply = Boolean(importPlan) && importPlan.counts.create > 0 && importPlan.counts.conflict === 0

  function previewImport(event) {
    event.preventDefault()
    onPreview({
      clientId,
      partialPolicy,
      projectId: projectId === 'none' ? '' : projectId,
      rawMarkdown,
    })
  }

  function changeClient(nextClientId) {
    setClientId(nextClientId)
    setProjectId('none')
    onInvalidatePreview()
  }

  function fillExample() {
    setRawMarkdown(createExampleMarkdown())
    onInvalidatePreview()
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function readMarkdownFile(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setRawMarkdown(String(reader.result ?? ''))
      onInvalidatePreview()
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-xl gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={previewImport}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text-primary">Import task Markdown</DialogTitle>
              <DialogDescription>
                Paste or upload a Markdown checklist, preview the task changes, then create the new tasks.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
              <section className="grid gap-component rounded-block bg-block p-card">
                {!hasClients ? (
                  <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                    Create or assign a client workspace before importing tasks.
                  </div>
                ) : null}

                <div className="grid gap-component sm:grid-cols-3">
                  <label className="grid gap-2">
                    <Label htmlFor="task-import-client">Client</Label>
                    <Select disabled={!hasClients} onValueChange={changeClient} value={clientId}>
                      <SelectTrigger id="task-import-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="grid gap-2">
                    <Label htmlFor="task-import-project">Project</Label>
                    <Select onValueChange={(nextProjectId) => {
                      setProjectId(nextProjectId)
                      onInvalidatePreview()
                    }} value={projectId}>
                      <SelectTrigger id="task-import-project">
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {selectedClientProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="grid gap-2">
                    <Label htmlFor="task-import-partial-policy">Partial data</Label>
                    <Select onValueChange={(nextPartialPolicy) => {
                      setPartialPolicy(nextPartialPolicy)
                      onInvalidatePreview()
                    }} value={partialPolicy}>
                      <SelectTrigger id="task-import-partial-policy">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TASK_IMPORT_PARTIAL_POLICIES).map((policy) => (
                          <SelectItem key={policy} value={policy}>
                            {PARTIAL_POLICY_LABEL[policy]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>

                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Label htmlFor="task-import-markdown">Task Markdown</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        accept=".md,.markdown,text/markdown,text/plain"
                        className="hidden"
                        onChange={readMarkdownFile}
                        type="file"
                      />
                      <Button icon={<Icon name="fileText" size={15} />} onClick={openFilePicker} size="sm" type="button" variant="outline">
                        Upload
                      </Button>
                      <Button onClick={fillExample} size="sm" type="button" variant="ghost">
                        Use example
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    className="min-h-[28rem] font-mono text-xs leading-5"
                    id="task-import-markdown"
                    onChange={(event) => {
                      setRawMarkdown(event.target.value)
                      onInvalidatePreview()
                    }}
                    required
                    spellCheck={false}
                    value={rawMarkdown}
                  />
                </div>
              </section>

              <div className="grid content-start gap-component">
                {importError ? (
                  <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {importError}
                  </div>
                ) : null}
                <WarningList warnings={importPlan?.warnings} />
                <ImportPlanPreview plan={importPlan} />
              </div>
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-sm text-text-muted">{saveState}</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={!canPreview} icon={<Icon name="search" size={15} />} type="submit" variant="outline">
                Preview
              </Button>
              <Button disabled={!canApply} icon={<Icon name="plus" size={15} />} onClick={onApply} type="button">
                Create Tasks
              </Button>
            </div>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
