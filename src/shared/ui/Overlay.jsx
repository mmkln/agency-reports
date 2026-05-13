import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

export const OverlayHeader = forwardRef(function OverlayHeader(
  { className, ...props },
  ref,
) {
  return (
    <div
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
  { className, ...props },
  ref,
) {
  return <div className={cn('px-panel py-card', className)} ref={ref} {...props} />
})

export const OverlayFooter = forwardRef(function OverlayFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'border-t border-island-border bg-material-chrome px-panel py-card backdrop-blur-2xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
