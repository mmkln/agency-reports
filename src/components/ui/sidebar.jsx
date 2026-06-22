"use client"

/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { PanelLeftIcon } from 'lucide-react'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const SidebarContext = React.createContext(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

function SidebarProvider({
  children,
  className,
  defaultOpen = true,
  onOpenChange: setOpenProp,
  open: openProp,
  style,
  ...props
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback((value) => {
    const openState = typeof value === 'function' ? value(open) : value

    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }

    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [open, setOpenProp])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current)
      return
    }

    setOpen((current) => !current)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'
  const contextValue = React.useMemo(() => ({
    isMobile,
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    state,
    toggleSidebar,
  }), [isMobile, open, openMobile, setOpen, state, toggleSidebar])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={200}>
        <div
          className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
          data-slot="sidebar-wrapper"
          style={{
            '--sidebar-width': 'var(--spacing-sidebar-expanded)',
            '--sidebar-width-icon': 'var(--spacing-sidebar-collapsed)',
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  children,
  className,
  collapsible = 'icon',
  side = 'left',
  ...props
}) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          className="w-sidebar-expanded bg-sidebar p-0 text-text-primary [&>button]:hidden"
          data-mobile="true"
          data-sidebar="sidebar"
          data-slot="sidebar"
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Primary application navigation.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-text-secondary md:block"
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
      data-slot="sidebar"
      data-state={state}
    >
      <div
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-motion-disclosure ease-motion-emphasized',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
        data-slot="sidebar-gap"
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden h-svh w-(--sidebar-width) border-r border-sidebar-border bg-sidebar transition-[width] duration-motion-disclosure ease-motion-emphasized md:flex',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          className,
        )}
        data-side={side}
        data-slot="sidebar-container"
        {...props}
      >
        <div className="flex size-full flex-col overflow-hidden bg-sidebar" data-sidebar="sidebar" data-slot="sidebar-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarInset({
  className,
  ...props
}) {
  return (
    <main
      className={cn('relative flex min-w-0 flex-1 flex-col bg-background', className)}
      data-slot="sidebar-inset"
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      className={cn(className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({
  className,
  ...props
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      aria-label="Toggle sidebar"
      className={cn(
        'absolute inset-y-0 right-0 hidden w-control cursor-ew-resize transition-colors duration-motion-fast ease-motion-standard after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-sidebar-border md:block',
        className,
      )}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      tabIndex={-1}
      title="Toggle sidebar"
      type="button"
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  ...props
}) {
  return <div className={cn('grid gap-micro p-control', className)} data-sidebar="header" data-slot="sidebar-header" {...props} />
}

function SidebarContent({
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col gap-item overflow-y-auto overflow-x-hidden p-control group-data-[collapsible=icon]:overflow-hidden', className)}
      data-sidebar="content"
      data-slot="sidebar-content"
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  ...props
}) {
  return <div className={cn('grid gap-micro border-t border-sidebar-border p-control', className)} data-sidebar="footer" data-slot="sidebar-footer" {...props} />
}

function SidebarGroup({
  className,
  ...props
}) {
  return <div className={cn('grid gap-micro', className)} data-sidebar="group" data-slot="sidebar-group" {...props} />
}

function SidebarMenu({
  className,
  ...props
}) {
  return <ul className={cn('grid min-w-0 gap-micro', className)} data-sidebar="menu" data-slot="sidebar-menu" {...props} />
}

function SidebarMenuItem({
  className,
  ...props
}) {
  return <li className={cn('min-w-0', className)} data-sidebar="menu-item" data-slot="sidebar-menu-item" {...props} />
}

const sidebarMenuButtonVariants = cva(
  'group/menu-button relative grid h-target w-full min-w-0 grid-cols-[var(--spacing-layout)_minmax(0,1fr)] items-center overflow-hidden rounded-control text-left text-ui text-text-secondary no-underline outline-none transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/35 active:bg-fill data-[active=true]:bg-control-selected data-[active=true]:text-action disabled:pointer-events-none disabled:opacity-50 [&>*:first-child]:mx-auto [&>*:first-child]:shrink-0 [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&>span:last-child]:min-w-0 [&>span:last-child]:truncate [&>span:last-child]:pr-control group-data-[collapsible=icon]:[&>span:last-child]:sr-only',
  {
    variants: {
      size: {
        default: '',
        compact: 'h-control-small text-label',
      },
      variant: {
        default: '',
        quiet: 'text-text-muted data-[active=true]:text-action',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
)

function SidebarMenuButton({
  asChild = false,
  className,
  isActive = false,
  size = 'default',
  tooltip,
  variant = 'default',
  ...props
}) {
  const Comp = asChild ? Slot.Root : 'button'
  const { isMobile, state } = useSidebar()
  const button = (
    <Comp
      className={cn(sidebarMenuButtonVariants({ className, size, variant }))}
      data-active={isActive}
      data-sidebar="menu-button"
      data-slot="sidebar-menu-button"
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        side="right"
        {...tooltipProps}
      />
    </Tooltip>
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}) {
  return (
    <div className={cn('flex h-target items-center gap-item rounded-control px-control', className)} data-sidebar="menu-skeleton" data-slot="sidebar-menu-skeleton" {...props}>
      {showIcon ? <Skeleton className="size-4 rounded-control" data-sidebar="menu-skeleton-icon" /> : null}
      <Skeleton className="h-4 flex-1" data-sidebar="menu-skeleton-text" />
    </div>
  )
}

function SidebarMenuSub({
  className,
  ...props
}) {
  return (
    <ul
      className={cn('grid min-w-0 gap-micro py-micro pl-control group-data-[collapsible=icon]:hidden', className)}
      data-sidebar="menu-sub"
      data-slot="sidebar-menu-sub"
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}) {
  return <li className={cn('min-w-0', className)} data-sidebar="menu-sub-item" data-slot="sidebar-menu-sub-item" {...props} />
}

function SidebarMenuSubButton({
  asChild = false,
  className,
  isActive = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      className={cn(
        'flex h-target min-w-0 items-center rounded-control px-control text-ui text-text-secondary no-underline outline-none transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/35 data-[active=true]:bg-control-selected data-[active=true]:text-action [&>span:last-child]:truncate',
        className,
      )}
      data-active={isActive}
      data-sidebar="menu-sub-button"
      data-slot="sidebar-menu-sub-button"
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
