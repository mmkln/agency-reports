import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { useInspectorId } from './inspectorId'

function ScrollArea({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('ScrollArea', id)

  return (
    <ScrollAreaPrimitive.Root
      id={inspectorId}
      className={cn('relative overflow-hidden', className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className="h-full w-full rounded-[inherit]"
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
)
}

function ScrollBar({ className, id, orientation = 'vertical', ...props }) {
  const inspectorId = useInspectorId('ScrollBar', id)

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      id={inspectorId}
      className={cn(
        'flex touch-none select-none transition-colors duration-motion-fast ease-motion-standard',
        orientation === 'vertical'
          ? 'h-full w-2.5 border-l border-l-transparent p-px'
          : 'h-2.5 flex-col border-t border-t-transparent p-px',
        className,
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
