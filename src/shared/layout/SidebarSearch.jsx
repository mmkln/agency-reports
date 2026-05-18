import { cn } from '@/lib/utils'

import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Icon } from '../icons'

export function SidebarSearch({ placeholder }) {
  const { setOpen, state } = useSidebar()

  if (state === 'collapsed') {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setOpen(true)}
          tooltip="Search"
          type="button"
          variant="quiet"
        >
          <Icon className="text-current" name="search" size={17} />
          <span>Search</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <label
        className={cn(
          'grid h-target min-w-0 grid-cols-[var(--spacing-layout)_minmax(0,1fr)] items-center rounded-control text-ui text-text-muted transition-colors duration-motion-fast ease-motion-standard focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/35 hover:bg-fill-secondary hover:text-text-secondary',
        )}
      >
        <Icon className="mx-auto shrink-0 text-current" name="search" size={17} />
        <span className="sr-only">Global finder</span>
        <input
          className="h-target min-w-0 bg-transparent pr-control text-ui text-text-primary outline-none placeholder:text-text-placeholder"
          placeholder={placeholder}
          type="search"
        />
      </label>
    </SidebarMenuItem>
  )
}
