import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { clearAuthSession } from '../../domain/services/authService'
import { USER_ROLES } from '../../entities/profile'
import { Icon } from '../icons'
import { useToast } from '../notifications'
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
          className="relative rounded-full text-slate-400 hover:text-slate-600"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon name="bell" size={20} />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
          <span className="text-sm font-semibold text-slate-900">Notifications</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {unreadCount} new
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1 py-1">
          {demoNotifications.map((notification) => (
            <div
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
              key={notification.id}
            >
              <span className={`mt-1 h-2 w-2 rounded-full ${notification.isUnread ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <span className="min-w-0">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold leading-5 text-slate-900">{notification.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{notification.time}</span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">{notification.body}</span>
              </span>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-slate-500">
          Demo notifications only. Live alerts will connect to workspace activity later.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopNav({ activeRoute, defaultRoute, onAuthChange, runtime, routes }) {
  const viewer = runtime.viewer
  const toast = useToast()
  const activeRole = roleMeta[viewer.role] ?? {
    label: viewer.role,
    searchPlaceholder: 'Search...',
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center overflow-x-auto">
            <BrandLogo className="mr-8 shrink-0" href={defaultRoute.href} variant="static" />

            <div className="flex gap-1">
              {routes.map((route) => {
                const isActive = route.id === activeRoute.id

                return (
                  <a
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    href={route.href}
                    key={route.id}
                  >
                    <Icon
                      className={isActive ? 'text-indigo-600' : 'text-slate-500'}
                      name={route.iconName}
                      size={16}
                    />
                    <span>{route.navLabel ?? route.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="ml-4 hidden items-center gap-4 md:flex">
            <label className="relative w-64 lg:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="text-slate-400" name="search" size={16} />
              </span>
              <Input
                className="bg-slate-50/50 pl-10"
                placeholder={activeRole.searchPlaceholder}
                type="text"
              />
            </label>
            <NotificationsMenu />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open account menu"
                  className="rounded-full border-indigo-200 bg-gradient-to-tr from-indigo-100 to-indigo-50 hover:border-indigo-300 hover:bg-indigo-50"
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Icon className="text-indigo-600" name="user" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm font-semibold text-slate-900">{viewer.name}</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">{viewer.email}</span>
                  <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {activeRole.label}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-rose-600 focus:text-rose-700"
                  onSelect={() => {
                    toast.info('Signed out', 'You have returned to the login screen.')
                    clearAuthSession()
                    onAuthChange?.()
                    window.location.hash = 'login'
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
