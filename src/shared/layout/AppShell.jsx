import { PageHeader } from './PageHeader'
import { TopNav } from './TopNav'

export function AppShell({
  activeRoute,
  children,
  defaultRoute,
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
      <TopNav
        activeRoute={activeRoute}
        defaultRoute={defaultRoute}
        hasUnsavedChanges={hasUnsavedChanges}
        onAuthChange={onAuthChange}
        runtime={runtime}
        routes={navRoutes}
      />
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
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8" key={routeKey}>
          {children}
        </div>
      )}
    </main>
  )
}
