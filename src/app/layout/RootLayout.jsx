import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import {
  canAccessRouteWithContext,
  filterRoutesForNavigation,
  getDefaultNavigationScopeForViewer,
  getRouteClientId,
  isClientScopedRoute,
} from '../routing/roleAccess'
import { routeMetadata } from '../routing/routeDefinitions'
import { listAgencyWorkspaceClients } from '../../domain/services/adminClientService'
import { getRouteAccessClientContext } from '../../domain/services/routeAccessContextService'
import {
  canUseAgencyWorkspaceSwitcher,
  hasAgencyAdminMembership,
  hasAgencyMembership,
} from '../../domain/policies/routeAccessPolicy'
import { AGENCY_ROLE_META } from '../../entities/agency-membership'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'
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

function getSidebarViewerMeta(viewer) {
  const agencyMembership = viewer?.agencyMemberships?.[0]

  if (agencyMembership) {
    return {
      label: AGENCY_ROLE_META[agencyMembership.role]?.label ?? 'Agency member',
      searchPlaceholder: hasAgencyAdminMembership(viewer)
        ? 'Search accounts, reports...'
        : 'Search tasks, accounts...',
    }
  }

  const workspaceMembership = viewer?.workspaceMemberships?.[0]

  if (workspaceMembership) {
    return {
      label: WORKSPACE_ROLE_META[workspaceMembership.role]?.label ?? 'Workspace member',
      searchPlaceholder: 'Search portal...',
    }
  }

  return {
    label: hasAgencyMembership(viewer) ? 'Agency member' : 'Workspace',
    searchPlaceholder: 'Search...',
  }
}

export function RootLayout() {
  const { onAuthChange, onLogin, onSignOut, runtime, viewer } = useAuth()
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
        viewer,
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

  const handleExitClientWorkspace = () => {
    navigate('/admin/clients')
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
    navigationScope: getDefaultNavigationScopeForViewer(viewer),
    routeParams,
    routes: routeMetadata,
    viewer,
  })
  const workspaceClients = workspaceClientsResource.data ?? []
  const selectedWorkspaceClientId = routeParams.clientId ?? null
  const selectedWorkspaceClient = workspaceClients.find((client) => client.id === selectedWorkspaceClientId) ?? null
  const currentClientWorkspacePageId = getClientWorkspacePageIdByRoutePath(location.pathname)
  const canUseClientWorkspaceSelector = canUseAgencyWorkspaceSwitcher(viewer)
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
        onSignOut={onSignOut}
        routeParams={routeParams}
        runtime={runtime}
        sidebarNavigationItems={sidebarNavigationItems}
        sidebarViewerMeta={getSidebarViewerMeta(viewer)}
        sidebarWorkspaceSwitcher={canUseClientWorkspaceSelector ? (
          <ClientWorkspaceSwitcher
            clients={workspaceClients}
            isLoading={workspaceClientsResource.status === 'loading'}
            onExitWorkspace={handleExitClientWorkspace}
            onSelectClient={handleClientWorkspaceSelect}
            selectedClientId={selectedWorkspaceClientId}
            showExitWorkspace={isClientWorkspaceNavigationActive}
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
