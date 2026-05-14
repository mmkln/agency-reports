import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'

import { clearAuthSession } from '../../domain/services/authService'
import { USER_ROLES } from '../../entities/profile'
import { Icon } from '../icons'
import { useToast } from '../notifications'
import { useTheme } from '../theme'
import { BrandLogo } from '../ui'

const roleMeta = {
  [USER_ROLES.AGENCY_ADMIN]: {
    label: 'Agency Admin',
    searchPlaceholder: 'Search clients, reports...',
  },
  [USER_ROLES.AGENCY_TEAM]: {
    label: 'Agency Team',
    searchPlaceholder: 'Search tasks, clients...',
  },
  [USER_ROLES.CLIENT_USER]: {
    label: 'Client User',
    searchPlaceholder: 'Search portal...',
  },
}

const demoNotifications = [
  {
    body: 'Green Dental Clinic approved the creative batch and left a note.',
    id: 'notification-creative-approved',
    isUnread: true,
    time: '4m ago',
    title: 'Creative batch approved',
  },
  {
    body: 'GA4 conversion tracking still needs a final event mapping check.',
    id: 'notification-ga4-check',
    isUnread: true,
    time: '22m ago',
    title: 'Tracking task needs review',
  },
  {
    body: 'April 2026 report is ready for the client portal preview.',
    id: 'notification-report-ready',
    isUnread: false,
    time: 'Yesterday',
    title: 'Report draft ready',
  },
]

const sidebarRailItemWidth = 'w-[calc(var(--spacing-sidebar-collapsed)-var(--spacing-component))]'
const sidebarExpandedItemWidth = 'sm:group-hover/app-sidebar:w-[calc(var(--spacing-sidebar-expanded)-var(--spacing-component))] sm:group-focus-within/app-sidebar:w-[calc(var(--spacing-sidebar-expanded)-var(--spacing-component))]'
const sidebarLabelClass = 'ml-[calc(var(--spacing-sidebar-collapsed)-var(--spacing-component))] min-w-0 truncate pr-control opacity-0 transition-opacity duration-motion-fast delay-motion-label ease-motion-standard sm:group-hover/app-sidebar:opacity-100 sm:group-focus-within/app-sidebar:opacity-100'
const sidebarIconSlotClass = `absolute left-0 top-1/2 flex ${sidebarRailItemWidth} -translate-y-1/2 items-center justify-center`

const sidebarRowTone = {
  nav: {
    active: 'bg-fill-secondary text-text-primary',
    idle: 'text-text-secondary hover:bg-fill-tertiary hover:text-text-primary',
  },
  utility: {
    active: '',
    idle: 'text-text-muted hover:bg-fill-tertiary hover:text-text-primary',
  },
  search: {
    active: '',
    idle: 'text-text-muted hover:bg-transparent hover:text-text-secondary',
  },
}

function sidebarRowClass({ isActive = false, tone = 'nav' } = {}) {
  const toneClass = sidebarRowTone[tone] ?? sidebarRowTone.nav

  return cn(
    'relative mx-item flex h-target items-center overflow-hidden rounded-control text-ui font-medium no-underline outline-none transition-[width,background-color,color] duration-motion-fast ease-motion-standard focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/35',
    sidebarRailItemWidth,
    sidebarExpandedItemWidth,
    isActive ? toneClass.active : toneClass.idle,
  )
}

function ThemeModeControl() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  return (
    <div className="px-1 py-1">
      <DropdownMenuLabel className="px-control py-tag">
        <span className="block text-label text-text-secondary">Appearance</span>
        <span className="mt-0.5 block text-xs font-normal text-text-muted">
          Current: {resolvedTheme === 'dark' ? 'dark' : 'light'}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
        <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </div>
  )
}

function SidebarNavItem({ isActive, route }) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={sidebarRowClass({ isActive, tone: 'nav' })}
      title={route.navLabel ?? route.label}
      to={route.path}
    >
      <span className={sidebarIconSlotClass}>
        <Icon className="text-current" name={route.iconName} size={18} />
      </span>
      <span className={sidebarLabelClass}>{route.navLabel ?? route.label}</span>
    </Link>
  )
}

function SidebarSearch({ placeholder }) {
  return (
    <div className={cn(sidebarRowClass({ tone: 'search' }), 'cursor-text')}>
      <span className={sidebarIconSlotClass}>
        <Icon className="text-current" name="search" size={17} />
      </span>
      <label className={cn(sidebarLabelClass, 'hidden sm:block')}>
        <span className="sr-only">Global finder</span>
        <input
          className="h-target w-full bg-transparent text-ui text-text-primary outline-none placeholder:text-text-placeholder"
          placeholder={placeholder}
          type="search"
        />
      </label>
    </div>
  )
}

function NotificationsMenu() {
  const unreadCount = demoNotifications.filter((notification) => notification.isUnread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open notifications"
          className={sidebarRowClass({ tone: 'utility' })}
          title="Notifications"
          type="button"
        >
          <span className={sidebarIconSlotClass}>
            <span className="relative flex size-control-small items-center justify-center">
              <Icon className="text-current" name="bell" size={18} />
              {unreadCount > 0 ? (
              <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-link px-1 text-[9px] font-semibold leading-none text-action-foreground ring-2 ring-sidebar">
                  {unreadCount}
                </span>
              ) : null}
            </span>
          </span>
          <span className={sidebarLabelClass}>Notifications</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-2" side="right">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
          <span className="text-sm font-semibold text-text-primary">Notifications</span>
          <span className="rounded-full bg-action-muted px-2 py-0.5 text-xs font-medium text-action">
            {unreadCount} new
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1 py-1">
          {demoNotifications.map((notification) => (
            <div
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-item px-control py-item transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-tertiary"
              key={notification.id}
            >
              <span className={`mt-1 h-2 w-2 rounded-full ${notification.isUnread ? 'bg-link' : 'bg-fill-secondary'}`} />
              <span className="min-w-0">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold leading-5 text-text-primary">{notification.title}</span>
                  <span className="shrink-0 text-xs text-text-quaternary">{notification.time}</span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-text-secondary">{notification.body}</span>
              </span>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-text-secondary">
          Demo notifications only. Live alerts will connect to workspace activity later.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AccountMenu({ activeRole, hasUnsavedChanges, onAuthChange, viewer }) {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className={cn(sidebarRowClass({ tone: 'utility' }), 'text-left')}
          title={`${viewer.name} - ${activeRole.label}`}
          type="button"
        >
          <span className={cn(sidebarIconSlotClass, 'text-text-secondary')}>
            <Icon className="text-current" name="user" size={18} />
          </span>
          <span className={cn(sidebarLabelClass, 'leading-tight')}>
            <span className="block truncate text-label text-text-primary">{viewer.name}</span>
            <span className="mt-0.5 block truncate text-xs text-text-muted">{activeRole.label}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" side="right">
        <DropdownMenuLabel>
          <span className="block text-sm font-semibold text-text-primary">{viewer.name}</span>
          <span className="mt-0.5 block text-xs font-normal text-text-secondary">{viewer.email}</span>
          <span className="mt-2 inline-flex rounded-full bg-control px-2 py-0.5 text-xs font-semibold text-text-secondary">
            {activeRole.label}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeModeControl />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-rose-600 focus:text-destructive"
          onSelect={() => {
            if (
              hasUnsavedChanges
              && !window.confirm('You have unsaved editor changes. Sign out anyway?')
            ) {
              return
            }

            toast.info('Signed out', 'You have returned to the login screen.')
            clearAuthSession()
            onAuthChange?.()
            navigate('/login', { replace: true })
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({
  activeRoute,
  hasUnsavedChanges = false,
  onAuthChange,
  runtime,
  routes,
}) {
  const viewer = runtime.viewer
  const activeRole = roleMeta[viewer.role] ?? {
    label: viewer.role,
    searchPlaceholder: 'Search...',
  }

  return (
    <aside className="group/app-sidebar fixed inset-y-0 left-0 z-30 flex w-sidebar-collapsed flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-motion-disclosure ease-motion-emphasized sm:hover:w-sidebar-expanded sm:focus-within:w-sidebar-expanded">
      <div className="relative h-control-xl">
        <BrandLogo
          className="relative h-full min-w-0 gap-0 [&>span:first-child]:absolute [&>span:first-child]:left-[calc((var(--spacing-sidebar-collapsed)-var(--spacing-control-small))/2)] [&>span:first-child]:top-1/2 [&>span:first-child]:-translate-y-1/2 [&>span:last-child]:ml-[calc(var(--spacing-sidebar-collapsed)-var(--spacing-item))] [&>span:last-child]:whitespace-nowrap [&>span:last-child]:opacity-0 [&>span:last-child]:transition-opacity [&>span:last-child]:duration-motion-fast [&>span:last-child]:ease-motion-standard sm:group-hover/app-sidebar:[&>span:last-child]:opacity-100 sm:group-focus-within/app-sidebar:[&>span:last-child]:opacity-100"
          href={import.meta.env.BASE_URL}
          size="sm"
          variant="static"
        />
      </div>

      <div className="py-item">
        <SidebarSearch placeholder={activeRole.searchPlaceholder} />
      </div>

      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto py-item">
        <div className="grid gap-micro">
          {routes.map((route) => {
            const isActive = route.id === activeRoute.id

            return <SidebarNavItem isActive={isActive} key={route.id} route={route} />
          })}
        </div>
      </nav>

      <div className="grid gap-micro border-t border-sidebar-border py-item">
        <NotificationsMenu />
        <AccountMenu
          activeRole={activeRole}
          hasUnsavedChanges={hasUnsavedChanges}
          onAuthChange={onAuthChange}
          viewer={viewer}
        />
      </div>
    </aside>
  )
}
