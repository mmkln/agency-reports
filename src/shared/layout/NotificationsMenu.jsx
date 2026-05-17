import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Icon } from '../icons'
import {
  demoNotifications,
  sidebarIconSlotClass,
  sidebarLabelClass,
  sidebarRowClass,
} from './appSidebarStyles'

export function NotificationsMenu() {
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
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-link px-micro text-indicator tabular-nums text-action-foreground ring-2 ring-sidebar">
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
          <span className="text-ui text-text-primary">Notifications</span>
          <span className="rounded-full bg-action-muted px-2 py-0.5 text-label text-action">
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
                  <span className="text-ui text-text-primary">{notification.title}</span>
                  <span className="shrink-0 text-label font-normal text-text-quaternary">{notification.time}</span>
                </span>
                <span className="mt-0.5 block text-label font-normal text-text-secondary">{notification.body}</span>
              </span>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-label font-normal text-text-secondary">
          Demo notifications only. Live alerts will connect to workspace activity later.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
