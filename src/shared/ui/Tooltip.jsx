import { Tooltip as TooltipPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function TooltipProvider(props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />
}

function Tooltip(props) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({ className, sideOffset = 8, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 overflow-hidden rounded-item border border-island-border bg-material-vibrant px-control py-tag text-label text-text-primary shadow-premium backdrop-blur-2xl duration-motion-fast ease-motion-emphasized animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:ease-motion-exit data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)',
          className,
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
