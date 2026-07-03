import { Icon } from '@/shared/icons'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

function MoveButton({
  children,
  disabled,
  direction,
  onClick,
}) {
  return (
    <Button
      aria-label={children}
      className="text-text-muted hover:text-text-primary"
      disabled={disabled}
      onClick={onClick}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <Icon
        className={direction === 'up' ? 'rotate-180' : ''}
        name="chevronDown"
        size={16}
      />
    </Button>
  )
}

export function GrowthReviewLayoutModal({ editor }) {
  return (
    <Dialog open={editor.isOpen} onOpenChange={(open) => {
      if (!open) {
        editor.close()
      }
    }}>
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Customize Review</DialogTitle>
        </DialogHeader>

        <div className="grid gap-tag">
          {editor.draftItems.map((item, index) => {
            const isFirst = index === 0
            const isLast = index === editor.draftItems.length - 1

            return (
              <div
                className="flex min-h-target items-center justify-between gap-control border-b border-separator py-item last:border-b-0"
                key={item.widgetKey}
              >
                <span className="min-w-0 text-ui font-medium text-text-primary">
                  {item.label}
                </span>
                <span className="flex shrink-0 items-center gap-tag">
                  <MoveButton
                    disabled={isFirst || editor.isSaving}
                    direction="up"
                    onClick={() => editor.moveUp(item.widgetKey)}
                  >
                    Move up
                  </MoveButton>
                  <MoveButton
                    disabled={isLast || editor.isSaving}
                    direction="down"
                    onClick={() => editor.moveDown(item.widgetKey)}
                  >
                    Move down
                  </MoveButton>
                </span>
              </div>
            )
          })}
        </div>

        {editor.error ? (
          <p className="text-label font-medium text-destructive">{editor.error}</p>
        ) : null}

        <DialogFooter className="items-center justify-between gap-control sm:justify-between">
          <Button
            disabled={editor.isSaving}
            onClick={editor.resetToDefault}
            type="button"
            variant="ghost"
          >
            Reset Order
          </Button>
          <div className="flex items-center gap-control">
            <Button
              disabled={editor.isSaving}
              onClick={editor.close}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={editor.isSaving}
              onClick={editor.save}
              type="button"
            >
              {editor.isSaving ? 'Saving' : 'Done'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
