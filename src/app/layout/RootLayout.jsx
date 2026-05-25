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
  hasAgencyAdminMembership,
  hasAgencyMembership,
} from '../../domain/policies/routeAccessPolicy'
import { AGENCY_ROLE_META } from '../../entities/agency-membership'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'
import {
  getClientWorkspacePageIdByRoutePath,
} from '../../features/admin-client-workspace'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import {
  getDemoRoleOption,
  getDemoRoleOptionByViewer,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

const legacyHashRouteMap = Object.freeze({
  '#client-dashboard': '/client/growth-review',
  '#client-overview': '/client/growth-review',
  '#client-performance': '/client/growth-review',
  '#growth-review': '/client/growth-review',
  '#settings': '/client/settings',
  '#client-settings': '/client/settings',
  '#dashboard': '/client/growth-review',
  '#performance': '/client/growth-review',
  '#performance-dashboard': '/client/growth-review',
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
  const isClientWorkspaceNavigationActive = Boolean(
    selectedWorkspaceClient
    && currentClientWorkspacePageId,
  )

  return (
    <>
      <AppShell
        activeRoute={activeRoute}
        activeSidebarNavigationId={isClientWorkspaceNavigationActive ? 'admin-clients' : undefined}
        onAuthChange={onAuthChange}
        onSignOut={onSignOut}
        routeParams={routeParams}
        runtime={runtime}
        sidebarViewerMeta={getSidebarViewerMeta(viewer)}
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
