import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { getPageShellWidthClass, PageHeader } from '@/shared/ui'
import { AppSidebar } from './AppSidebar'

export function AppShell({
  activeRoute,
  activeSidebarNavigationId,
  children,
  hasUnsavedChanges = false,
  sidebarNavigationItems,
  sidebarWorkspaceSwitcher,
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
    <SidebarProvider className="min-h-screen bg-background font-sans text-foreground selection:bg-action-muted selection:text-action">
      <AppSidebar
        activeNavigationId={activeSidebarNavigationId}
        activeRoute={activeRoute}
        hasUnsavedChanges={hasUnsavedChanges}
        navigationItems={sidebarNavigationItems}
        onAuthChange={onAuthChange}
        onSignOut={onSignOut}
        runtime={runtime}
        routes={routes}
        viewerMeta={sidebarViewerMeta}
        workspaceSwitcher={sidebarWorkspaceSwitcher}
      />
      <SidebarInset className="min-h-screen overflow-x-hidden">
        <SidebarTrigger className="fixed left-control top-control z-40 md:hidden" />
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
      </SidebarInset>
    </SidebarProvider>
  )
}
