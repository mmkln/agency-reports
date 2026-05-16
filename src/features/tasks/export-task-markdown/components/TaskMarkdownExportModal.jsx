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
  Textarea,
} from '@/shared/ui'

import { Icon } from '../../../../shared/icons'
import { exportTasksToMarkdown } from '../model/taskMarkdownExport'

export function TaskMarkdownExportModal({
  isOpen,
  onClose,
  tasks,
  title,
}) {
  const [copyState, setCopyState] = useState('')
  const markdown = useMemo(() => exportTasksToMarkdown({
    tasks,
    title,
  }), [tasks, title])

  function copyMarkdown() {
    navigator.clipboard?.writeText(markdown)
      .then(() => setCopyState('Markdown copied.'))
      .catch(() => setCopyState('Select the Markdown and copy it manually.'))
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        <OverlayHeader className="pr-control-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-text-primary">Export task Markdown</DialogTitle>
            <DialogDescription>
              Current task results are grouped by status. Copy this Markdown into docs, planning notes, or a future import.
            </DialogDescription>
          </DialogHeader>
        </OverlayHeader>

        <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
          <div className="grid gap-component rounded-block bg-block p-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label htmlFor="task-export-markdown">Task Markdown</Label>
              <span className="text-label text-text-muted">{tasks.length} tasks</span>
            </div>
            <Textarea
              className="min-h-[28rem] font-mono text-xs leading-5"
              id="task-export-markdown"
              readOnly
              spellCheck={false}
              value={markdown}
            />
          </div>
        </OverlayBody>

        <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-sm text-text-muted">{copyState}</div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="outline">
              Close
            </Button>
            <Button icon={<Icon name="fileText" size={15} />} onClick={copyMarkdown} type="button">
              Copy Markdown
            </Button>
          </div>
        </OverlayFooter>
      </DialogContent>
    </Dialog>
  )
}
