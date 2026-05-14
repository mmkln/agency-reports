import { PageHeader } from '@/shared/ui'
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
  const routeKey = `${activeRoute.id}:${JSON.stringify(routeParams)}`

  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-action-muted selection:text-action">
      <AppSidebar
        activeRoute={activeRoute}
        hasUnsavedChanges={hasUnsavedChanges}
        onAuthChange={onAuthChange}
        runtime={runtime}
        routes={navRoutes}
      />
      <div className="min-h-screen pl-sidebar-collapsed">
        {!showRouteHeader || activeRoute.hidePageHeader ? null : (
          RouteHeader ? (
            <RouteHeader activeRoute={activeRoute} routeParams={routeParams} runtime={runtime} />
          ) : (
            <PageHeader
              subtitle={activeRoute.subtitle}
              title={activeRoute.pageTitle ?? activeRoute.label}
            />
          )
        )}
        {activeRoute.fullBleedContent ? (
          <div key={routeKey}>{children}</div>
        ) : (
          <div className="mx-auto grid w-full max-w-content gap-card px-app-gutter py-content-gutter" key={routeKey}>
            {children}
          </div>
        )}
      </div>
    </main>
  )
}
