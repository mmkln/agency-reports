import { getPageShellWidthClass, PageHeader } from '@/shared/ui'
import { AppTopHeader } from './AppTopHeader'

export function AppShell({
  activeRoute,
  activeSidebarNavigationId,
  children,
  hasUnsavedChanges = false,
  sidebarNavigationItems,
  onAuthChange,
  onSignOut,
  routeParams = {},
  runtime,
  showRouteHeader = true,
  routes,
  sidebarViewerMeta,
}) {
  const RouteHeader = activeRoute.header
  const routeKey = activeRoute.remountOnParamsChange
    ? `${activeRoute.id}:${JSON.stringify(routeParams)}`
    : activeRoute.id
  const contentWidth = activeRoute.contentWidth ?? 'full'

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-action-muted selection:text-action">
      <AppTopHeader
        activeNavigationId={activeSidebarNavigationId}
        activeRoute={activeRoute}
        hasUnsavedChanges={hasUnsavedChanges}
        navigationItems={sidebarNavigationItems}
        onAuthChange={onAuthChange}
        onSignOut={onSignOut}
        runtime={runtime}
        routes={routes}
        viewerMeta={sidebarViewerMeta}
      />
      <main className="min-h-[calc(100vh-var(--spacing-control-xl))] overflow-x-hidden">
        {!showRouteHeader || activeRoute.hidePageHeader ? null : (
          RouteHeader ? (
            <RouteHeader activeRoute={activeRoute} routeParams={routeParams} runtime={runtime} />
          ) : (
            <PageHeader
              title={activeRoute.pageTitle ?? activeRoute.label}
              width={contentWidth}
            />
          )
        )}
        {activeRoute.fullBleedContent ? (
          <div key={routeKey}>{children}</div>
        ) : (
          <div
            className={`grid w-full gap-card px-app-gutter py-content-gutter ${getPageShellWidthClass(contentWidth)}`}
            key={routeKey}
          >
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
