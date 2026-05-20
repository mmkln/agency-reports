import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import {
  canAccessRouteWithContext,
  filterRoutesForNavigation,
  getRouteClientId,
  isClientScopedRoute,
} from '../routing/roleAccess'
import { routeMetadata } from '../routing/routeDefinitions'
import { listAgencyWorkspaceClients } from '../../domain/services/adminClientService'
import { getRouteAccessClientContext } from '../../domain/services/routeAccessContextService'
import { USER_ROLES } from '../../entities/profile'
import {
  ClientWorkspaceSwitcher,
  getClientWorkspacePageIdByRoutePath,
  getClientWorkspaceSidebarItems,
} from '../../features/admin-client-workspace'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import {
  getDemoRoleOption,
  getDemoRoleOptionByViewer,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

const legacyHashRouteMap = Object.freeze({
  '#action-needed': '/client/action-needed',
  '#client-dashboard': '/client/reports-dashboards',
  '#client-files-links': '/client/files-links',
  '#client-overview': '/client/overview',
  '#client-performance': '/client/reports-dashboards',
  '#client-requests': '/client/requests',
  '#projects': '/client/projects',
  '#files-links': '/client/files-links',
  '#updates': '/client/updates',
  '#client-updates': '/client/updates',
  '#requests': '/client/requests',
  '#settings': '/client/settings',
  '#client-settings': '/client/settings',
  '#dashboard': '/client/reports-dashboards',
  '#performance': '/client/reports-dashboards',
  '#performance-dashboard': '/client/reports-dashboards',
})

export function RootLayout() {
  const { onAuthChange, onLogin, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())
  const routeParams = Object.fromEntries(searchParams.entries())
  const activeRoute = routeMetadata.find((route) => route.path === location.pathname) ?? routeMetadata[0]
  const routeClientId = getRouteClientId({
    defaultClientId: runtime.defaultClientId,
    routeParams,
    viewer,
  })
  const workspaceClientsResource = useAsyncResource({
    dependencyKey: `${viewer?.userId ?? 'anonymous'}:agency-workspace-clients`,
    initialData: [],
    load: () => {
      if (!viewer) {
        return Promise.resolve([])
      }

      return runtime.dataClient.read((repositories) => listAgencyWorkspaceClients({
        repositories,
        viewer,
      }))
    },
  })
  const routeAccessContextResource = useAsyncResource({
    dependencyKey: `${viewer?.userId ?? 'anonymous'}:route-access-context:${activeRoute?.id ?? ''}:${routeClientId ?? ''}`,
    initialData: null,
    load: () => {
      if (!viewer || !routeClientId) {
        return Promise.resolve(null)
      }

      return runtime.dataClient.read((repositories) => getRouteAccessClientContext({
        clientId: routeClientId,
        repositories,
      }))
    },
  })

  useEffect(() => {
    const hashRoute = legacyHashRouteMap[location.hash]

    if (!hashRoute || location.pathname !== '/') {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (runtime.defaultClientId && !nextParams.has('clientId')) {
      nextParams.set('clientId', runtime.defaultClientId)
    }

    const queryString = nextParams.toString()
    navigate(`${hashRoute}${queryString ? `?${queryString}` : ''}`, { replace: true })
  }, [location.hash, location.pathname, navigate, runtime.defaultClientId, searchParams])

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)
    writeDemoRoleKey(option.key)
    setDemoRoleKey(option.key)
    flushSync(() => {
      onLogin(option.userId)
    })
    navigate(option.homeHref, { replace: true })
  }

  const handleClientWorkspaceSelect = (clientId) => {
    navigate(`/admin/client-overview?clientId=${clientId}`)
  }

  if (!viewer) {
    return <Outlet />
  }

  if (activeRoute.layout === 'auth' || activeRoute.layout === 'public') {
    return <Outlet />
  }

  if (isClientScopedRoute(activeRoute) && routeAccessContextResource.status === 'loading') {
    return <Outlet />
  }

  const routeAccessContext = routeAccessContextResource.data
  const canAccessActiveRoute = canAccessRouteWithContext(viewer, activeRoute, {
    clientType: routeAccessContext?.clientType,
    defaultClientId: runtime.defaultClientId,
    routeParams,
  })

  if (!canAccessActiveRoute) {
    return <Outlet />
  }

  const accessibleRoutes = filterRoutesForNavigation({
    clientType: routeAccessContext?.clientType,
    defaultClientId: runtime.defaultClientId,
    routeParams,
    routes: routeMetadata,
    viewer,
  })
  const workspaceClients = workspaceClientsResource.data ?? []
  const selectedWorkspaceClientId = routeParams.clientId ?? null
  const selectedWorkspaceClient = workspaceClients.find((client) => client.id === selectedWorkspaceClientId) ?? null
  const currentClientWorkspacePageId = getClientWorkspacePageIdByRoutePath(location.pathname)
  const canUseClientWorkspaceSelector = [USER_ROLES.AGENCY_ADMIN].includes(viewer.role)
  const isClientWorkspaceNavigationActive = Boolean(
    canUseClientWorkspaceSelector
    && selectedWorkspaceClient
    && currentClientWorkspacePageId,
  )
  const sidebarNavigationItems = isClientWorkspaceNavigationActive
    ? getClientWorkspaceSidebarItems(selectedWorkspaceClient, selectedWorkspaceClient.id)
    : undefined

  return (
    <>
      <AppShell
        activeRoute={activeRoute}
        activeSidebarNavigationId={isClientWorkspaceNavigationActive ? currentClientWorkspacePageId : undefined}
        onAuthChange={onAuthChange}
        routeParams={routeParams}
        runtime={runtime}
        sidebarNavigationItems={sidebarNavigationItems}
        sidebarWorkspaceSwitcher={canUseClientWorkspaceSelector ? (
          <ClientWorkspaceSwitcher
            clients={workspaceClients}
            isLoading={workspaceClientsResource.status === 'loading'}
            onSelectClient={handleClientWorkspaceSelect}
            selectedClientId={selectedWorkspaceClientId}
          />
        ) : null}
        routes={accessibleRoutes}
      >
        <Outlet />
      </AppShell>
      <DemoRoleSwitcher
        activeRoleKey={viewer ? getDemoRoleOptionByViewer(viewer).key : demoRoleKey}
        onRoleChange={handleDemoRoleChange}
      />
    </>
  )
}
