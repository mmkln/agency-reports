import { forwardRef } from 'react'

import { cn } from '@/lib/utils'
import { useInspectorId } from './inspectorId'

export const OverlayHeader = forwardRef(function OverlayHeader(
  { className, id, ...props },
  ref,
) {
  const inspectorId = useInspectorId('OverlayHeader', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'border-b border-island-border bg-material-chrome px-panel py-card backdrop-blur-2xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})

export const OverlayBody = forwardRef(function OverlayBody(
  { className, id, ...props },
  ref,
) {
  const inspectorId = useInspectorId('OverlayBody', id)

  return <div id={inspectorId} className={cn('px-panel py-card', className)} ref={ref} {...props} />
})

export const OverlayFooter = forwardRef(function OverlayFooter(
  { className, id, ...props },
  ref,
) {
  const inspectorId = useInspectorId('OverlayFooter', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'border-t border-island-border bg-material-chrome px-panel py-card backdrop-blur-2xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
