import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useInspectorId } from './inspectorId'
import { OverlayBody, OverlayFooter, OverlayHeader } from './Overlay'

export const FullscreenDialog = Dialog
export const FullscreenDialogTrigger = DialogTrigger

export function FullscreenDialogContent({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('FullscreenDialogContent', id)

  return (
    <DialogContent
      className={cn('gap-0', className)}
      id={inspectorId}
      variant="fullscreen"
      {...props}
    >
      {children}
    </DialogContent>
  )
}

export function FullscreenDialogHeader({ children, className, description, id, title }) {
  const inspectorId = useInspectorId('FullscreenDialogHeader', id)

  return (
    <OverlayHeader className={cn('shrink-0 pr-control-xl', className)} id={inspectorId}>
      <div className="mx-auto w-full max-w-content">
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        {description ? (
          <DialogDescription className="mt-tag">{description}</DialogDescription>
        ) : null}
        {children}
      </div>
    </OverlayHeader>
  )
}

export function FullscreenDialogBody({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('FullscreenDialogBody', id)

  return (
    <OverlayBody
      className={cn('min-h-0 flex-1 overflow-y-auto bg-surface-subtle', className)}
      id={inspectorId}
      {...props}
    >
      <div className="mx-auto w-full max-w-content">{children}</div>
    </OverlayBody>
  )
}

export function FullscreenDialogFooter({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('FullscreenDialogFooter', id)

  return (
    <OverlayFooter className={cn('shrink-0', className)} id={inspectorId} {...props}>
      <div className="mx-auto flex w-full max-w-content flex-col-reverse gap-item sm:flex-row sm:justify-end">
        {children}
      </div>
    </OverlayFooter>
  )
}
