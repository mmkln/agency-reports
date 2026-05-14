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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

function NotificationsMenu() {
  const unreadCount = demoNotifications.filter((notification) => notification.isUnread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative rounded-full text-text-secondary hover:text-text-primary"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon name="bell" size={20} />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold leading-none text-action-foreground ring-2 ring-background">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
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
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-item px-control py-item transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover"
              key={notification.id}
            >
              <span className={`mt-1 h-2 w-2 rounded-full ${notification.isUnread ? 'bg-action' : 'bg-control-selected'}`} />
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

function PrimaryNavItem({ isActive, route }) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={`group/nav-item inline-flex h-control-small shrink-0 items-center gap-2 rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard ${
        isActive
          ? 'bg-control-selected text-text-primary'
          : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
      }`}
      to={route.path}
    >
      <Icon
        className="text-current transition-colors duration-motion-fast ease-motion-standard"
        name={route.iconName}
        size={15}
      />
      <span className="max-w-36 truncate">{route.navLabel ?? route.label}</span>
    </Link>
  )
}

export function TopNav({
  activeRoute,
  hasUnsavedChanges = false,
  onAuthChange,
  runtime,
  routes,
}) {
  const viewer = runtime.viewer
  const navigate = useNavigate()
  const toast = useToast()
  const activeRole = roleMeta[viewer.role] ?? {
    label: viewer.role,
    searchPlaceholder: 'Search...',
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 justify-between">
          <div className="flex min-w-0 flex-1 items-center">
            <BrandLogo className="mr-6 shrink-0" href={import.meta.env.BASE_URL} size="sm" variant="static" />

            <div
              aria-label="Primary navigation"
              className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {routes.map((route) => {
                const isActive = route.id === activeRoute.id

                return <PrimaryNavItem isActive={isActive} key={route.id} route={route} />
              })}
            </div>
          </div>

          <div className="ml-4 hidden items-center gap-4 md:flex">
            <label className="relative w-64 lg:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="text-text-secondary" name="search" size={16} />
              </span>
              <Input
                className="bg-control pl-10"
                placeholder={activeRole.searchPlaceholder}
                type="text"
              />
            </label>
            <NotificationsMenu />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open account menu"
                  className="rounded-full border-control-border bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary"
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Icon className="text-current" name="user" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
          </div>
        </div>
      </div>
    </nav>
  )
}
