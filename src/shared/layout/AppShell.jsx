import { PageHeader } from './PageHeader'
import { TopNav } from './TopNav'

export function AppShell({
  activeRoute,
  children,
  defaultRoute,
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
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <TopNav
        activeRoute={activeRoute}
        defaultRoute={defaultRoute}
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
