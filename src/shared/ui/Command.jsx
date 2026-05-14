import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useInspectorId } from './inspectorId'

function Command({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('Command', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-control bg-material-liquid text-text-primary backdrop-blur-2xl',
        className,
      )}
      data-slot="command"
      {...props}
    >
      {children}
    </div>
)
}

function CommandInput({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandInput', id)

  return (
    <div id={inspectorId} className="flex items-center border-b border-separator px-control" data-slot="command-input-wrapper">
      <Search className="mr-item h-4 w-4 shrink-0 text-text-muted" />
      <input
        className={cn(
          'flex h-target w-full rounded-control bg-transparent py-control text-ui text-text-primary outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        data-slot="command-input"
        {...props}
      />
    </div>
)
}

function CommandList({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandList', id)

  return (
    <div
      id={inspectorId}
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden', className)}
      data-slot="command-list"
      role="listbox"
      {...props}
    />
)
}

function CommandEmpty({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandEmpty', id)

  return (
    <div
      id={inspectorId}
      className={cn('py-card text-center text-ui text-text-muted', className)}
      data-slot="command-empty"
      {...props}
    />
)
}

function CommandGroup({ className, heading, id, ...props }) {
  const inspectorId = useInspectorId('CommandGroup', id)

  return (
    <div id={inspectorId} className={cn('overflow-hidden p-item text-text-primary', className)} data-slot="command-group">
      {heading ? <div className="px-control py-tag text-label text-text-muted">{heading}</div> : null}
      <div {...props} />
    </div>
)
}

function CommandItem({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandItem', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'relative flex cursor-default select-none items-center gap-item rounded-item px-control py-tag text-ui text-text-primary outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-control-hover data-[selected=true]:text-text-primary data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      data-slot="command-item"
      role="option"
      {...props}
    />
)
}

function CommandSeparator({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandSeparator', id)

  return (
    <div
      id={inspectorId}
      className={cn('-mx-1 h-px bg-separator', className)}
      data-slot="command-separator"
      {...props}
    />
)
}

function CommandShortcut({ className, id, ...props }) {
  const inspectorId = useInspectorId('CommandShortcut', id)

  return (
    <span
      id={inspectorId}
      className={cn('ml-auto text-label text-text-muted', className)}
      data-slot="command-shortcut"
      {...props}
    />
  )
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
