import { Link } from 'react-router-dom'

import { Icon } from '../icons'
import { BrandLogo } from '../ui'
import { AccountMenu } from './AccountMenu'
import { defaultSidebarViewerMeta } from './appSidebarStyles'

function flattenNavigationItems(items = []) {
  return items.flatMap((item) => {
    if (item.type === 'section' || item.type === 'group') {
      return flattenNavigationItems(item.children ?? [])
    }

    const route = item.route ?? item

    return route?.path ? [route] : []
  })
}

function TopNavLink({ isActive, route }) {
  const label = route.navLabel ?? route.label

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={[
        'inline-flex h-control-small items-center gap-tag rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard',
        isActive
          ? 'bg-control-selected text-text-primary'
          : 'text-text-secondary hover:bg-control-hover hover:text-text-primary',
      ].join(' ')}
      title={label}
      to={route.path}
    >
      {route.iconName ? <Icon className="text-current" name={route.iconName} size={15} /> : null}
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function AppTopHeader({
  activeNavigationId,
  activeRoute,
  hasUnsavedChanges = false,
  navigationItems,
  onAuthChange,
  onSignOut,
  routes,
  runtime,
  viewerMeta,
}) {
  const viewer = runtime.viewer
  const activeRole = viewerMeta ?? defaultSidebarViewerMeta
  const primaryRoutes = navigationItems
    ? flattenNavigationItems(navigationItems)
    : routes.filter((route) => route.showInNav !== false)
  const resolvedActiveNavigationId = activeNavigationId ?? activeRoute.id

  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-surface-chrome/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-control-xl w-full max-w-content items-center gap-control px-app-gutter">
        <BrandLogo
          className="min-w-0 shrink-0"
          href="/"
          size="sm"
          variant="static"
        />

        <nav
          aria-label="Primary navigation"
          className="flex min-w-0 flex-1 items-center gap-tag overflow-x-auto"
        >
          {primaryRoutes.map((route) => (
            <TopNavLink
              isActive={route.id === resolvedActiveNavigationId}
              key={route.id}
              route={route}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-tag">
          <AccountMenu
            activeRole={activeRole}
            align="end"
            hasUnsavedChanges={hasUnsavedChanges}
            onSignOut={onSignOut ?? onAuthChange}
            presentation="header"
            side="bottom"
            viewer={viewer}
          />
        </div>
      </div>
    </header>
  )
}
