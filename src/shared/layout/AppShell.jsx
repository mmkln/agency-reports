import { getPageShellWidthClass, PageHeader } from '@/shared/ui'
import { AppSidebar } from './AppSidebar'

export function AppShell({
  activeRoute,
  children,
  hasUnsavedChanges = false,
  onAuthChange,
  routeParams = {},
  runtime,
  showRouteHeader = true,
  routes,
}) {
  const navRoutes = routes.filter((route) => route.showInNav !== false)
  const RouteHeader = activeRoute.header
  const routeKey = activeRoute.remountOnParamsChange
    ? `${activeRoute.id}:${JSON.stringify(routeParams)}`
    : activeRoute.id
  const contentWidth = activeRoute.contentWidth ?? 'full'

  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-action-muted selection:text-action">
      <AppSidebar
        activeRoute={activeRoute}
        hasUnsavedChanges={hasUnsavedChanges}
        onAuthChange={onAuthChange}
        runtime={runtime}
        routes={navRoutes}
      />
      <div className="ml-sidebar-collapsed min-h-screen overflow-x-hidden">
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
      </div>
    </main>
  )
}
