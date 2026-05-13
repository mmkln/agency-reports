import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

function Command({ children, className, ...props }) {
  return (
    <div
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

function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center border-b border-separator px-control" data-slot="command-input-wrapper">
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

function CommandList({ className, ...props }) {
  return (
    <div
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden', className)}
      data-slot="command-list"
      role="listbox"
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }) {
  return (
    <div
      className={cn('py-card text-center text-ui text-text-muted', className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

function CommandGroup({ className, heading, ...props }) {
  return (
    <div className={cn('overflow-hidden p-item text-text-primary', className)} data-slot="command-group">
      {heading ? <div className="px-control py-tag text-label text-text-muted">{heading}</div> : null}
      <div {...props} />
    </div>
  )
}

function CommandItem({ className, ...props }) {
  return (
    <div
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

function CommandSeparator({ className, ...props }) {
  return (
    <div
      className={cn('-mx-1 h-px bg-separator', className)}
      data-slot="command-separator"
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }) {
  return (
    <span
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
