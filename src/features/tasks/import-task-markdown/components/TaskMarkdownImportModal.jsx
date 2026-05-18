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

import { Icon } from '../../../../shared/icons'
import { useTaskMarkdownImportModalState } from '../model/useTaskMarkdownImportModalState'
import { TaskMarkdownImportFields } from './TaskMarkdownImportFields'
import { TaskMarkdownImportPreview } from './TaskMarkdownImportPreview'

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
  const modalState = useTaskMarkdownImportModalState({
    clients,
    defaultClientId,
    importPlan,
    onInvalidatePreview,
    onPreview,
    projects,
  })

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-xl gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={modalState.previewImport}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-heading text-text-primary">Import task Markdown</DialogTitle>
              <DialogDescription>
                Paste or upload a Markdown checklist, preview the task changes, then create the new tasks.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>

          <OverlayBody className="min-h-0 overflow-y-auto bg-surface-subtle">
            <div className="grid gap-component lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
              <TaskMarkdownImportFields clients={clients} {...modalState} />
              <TaskMarkdownImportPreview importError={importError} importPlan={importPlan} />
            </div>
          </OverlayBody>

          <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-ui text-text-muted">{saveState}</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={!modalState.canPreview} icon={<Icon name="search" size={15} />} type="submit" variant="outline">
                Preview
              </Button>
              <Button disabled={!modalState.canApply} icon={<Icon name="plus" size={15} />} onClick={onApply} type="button">
                Create Tasks
              </Button>
            </div>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
