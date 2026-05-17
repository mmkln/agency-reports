import {
  Button,
  Label,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { Icon } from '../../../../shared/icons'
import { TASK_IMPORT_PARTIAL_POLICIES } from '../model/taskMarkdownImport'

const PARTIAL_POLICY_LABEL = Object.freeze({
  [TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING]: 'Fill missing fields',
  [TASK_IMPORT_PARTIAL_POLICIES.SKIP_INCOMPLETE]: 'Skip incomplete rows',
})

export function TaskMarkdownImportFields({
  changeClient,
  changePartialPolicy,
  changeProject,
  changeRawMarkdown,
  clientId,
  clients,
  fileInputRef,
  fillExample,
  hasClients,
  openFilePicker,
  partialPolicy,
  projectId,
  rawMarkdown,
  readMarkdownFile,
  selectedClientProjects,
}) {
  return (
    <section className="grid gap-component rounded-block bg-block p-card">
      {!hasClients ? (
        <div className="rounded-control border border-warning/25 bg-warning/10 px-3 py-2 text-ui text-warning-foreground">
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
          <Select onValueChange={changeProject} value={projectId}>
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
          <Select onValueChange={changePartialPolicy} value={partialPolicy}>
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
          className="min-h-[28rem] font-mono text-label font-normal"
          id="task-import-markdown"
          onChange={(event) => changeRawMarkdown(event.target.value)}
          required
          spellCheck={false}
          value={rawMarkdown}
        />
      </div>
    </section>
  )
}
