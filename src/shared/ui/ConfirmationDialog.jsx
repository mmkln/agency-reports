import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useInspectorId } from './inspectorId'

const toneConfig = {
  destructive: {
    confirmVariant: 'destructive',
  },
  primary: {
    confirmVariant: 'default',
  },
}

export function ConfirmationDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  description,
  id,
  isConfirming = false,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = 'primary',
}) {
  const inspectorId = useInspectorId('ConfirmationDialog', id)
  const config = toneConfig[tone] ?? toneConfig.primary

  function confirmAction() {
    onConfirm?.()
  }

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-scrim backdrop-blur-sm duration-motion-fast data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          id={inspectorId}
          className={cn(
            'fixed top-1/2 left-1/2 z-[91] grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-island border border-island-border bg-material-vibrant text-text-primary shadow-premium outline-none backdrop-blur-2xl',
            'duration-motion-medium ease-motion-emphasized data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:duration-motion-fast data-closed:ease-motion-exit data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          <div className="grid gap-2 p-5 pr-12">
            <DialogPrimitive.Title className="text-base font-semibold leading-6 text-text-primary">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm leading-6 text-text-secondary">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-island-border bg-material-chrome px-5 py-4 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close asChild>
              <Button disabled={isConfirming} type="button" variant="outline">
                {cancelLabel}
              </Button>
            </DialogPrimitive.Close>
            <Button
              disabled={isConfirming}
              onClick={confirmAction}
              type="button"
              variant={config.confirmVariant}
            >
              {confirmLabel}
            </Button>
          </div>

          <DialogPrimitive.Close asChild>
            <Button
              aria-label="Close confirmation dialog"
              className="absolute top-3 right-3 text-text-secondary hover:text-text-primary"
              disabled={isConfirming}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
