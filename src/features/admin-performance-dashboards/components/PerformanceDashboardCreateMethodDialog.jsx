import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

function CreateMethodOption({
  description,
  disabled = false,
  iconName,
  label,
  onSelect,
}) {
  return (
    <Button
      className="h-auto w-full items-start justify-start whitespace-normal rounded-none border-0 bg-transparent px-card py-component text-left shadow-none hover:bg-control-hover"
      disabled={disabled}
      icon={<Icon className="mt-micro text-text-secondary" name={iconName} size={17} />}
      onClick={onSelect}
      type="button"
      variant="ghost"
    >
      <span className="grid min-w-0 flex-1 gap-micro">
        <span className="text-ui text-text-primary">{label}</span>
        <span className="text-body font-normal text-text-secondary">{description}</span>
      </span>
    </Button>
  )
}

export function PerformanceDashboardCreateMethodDialog({
  hasClients,
  isOpen,
  onClose,
  onImportJson,
  onStartFromScratch,
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sheet-md gap-component p-panel">
        <DialogHeader className="pr-control-xl">
          <DialogTitle>New dashboard</DialogTitle>
          <DialogDescription>
            Choose a starting point.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-component">
          {!hasClients ? (
            <div className="rounded-control bg-warning/10 px-card py-item text-ui text-warning-foreground">
              Create an account workspace before adding performance dashboards.
            </div>
          ) : null}

          <div className="overflow-hidden rounded-block bg-block">
            <CreateMethodOption
              description="Create a blank draft in the editor."
              disabled={!hasClients}
              iconName="layoutDashboard"
              label="Start from scratch"
              onSelect={onStartFromScratch}
            />
            <div className="h-px bg-separator" />
            <CreateMethodOption
              description="Paste a prepared JSON draft."
              disabled={!hasClients}
              iconName="fileJson"
              label="Import from JSON"
              onSelect={onImportJson}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
