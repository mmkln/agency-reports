import { BrandLogo } from '../ui'
import { AccountMenu } from './AccountMenu'
import {
  roleMeta,
} from './appSidebarStyles'
import { NotificationsMenu } from './NotificationsMenu'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarSearch } from './SidebarSearch'

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
          href="/"
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
