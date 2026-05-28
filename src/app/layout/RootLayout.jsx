import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../providers/auth/useAuth'
import { AppShell } from '../../shared/layout'
import {
  canAccessRouteWithContext,
  filterRoutesForNavigation,
  getDefaultNavigationScopeForViewer,
  hasAgencyAdminMembership,
  hasAgencyMembership,
} from '../routing/roleAccess'
import { routeMetadata } from '../routing/routeDefinitions'
import { AGENCY_ROLE_META } from '../../entities/agency-membership'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'

const legacyHashRouteMap = Object.freeze({
  '#client-dashboard': '/client/growth-review',
  '#client-overview': '/client/growth-review',
  '#client-performance': '/client/growth-review',
  '#growth-review': '/client/growth-review',
  '#settings': '/client/growth-review',
  '#client-settings': '/client/growth-review',
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
  const { onAuthChange, onSignOut, runtime, viewer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeParams = Object.fromEntries(searchParams.entries())
  const activeRoute = routeMetadata.find((route) => route.path === location.pathname) ?? routeMetadata[0]

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

  if (!viewer) {
    return <Outlet />
  }

  if (activeRoute.layout === 'auth' || activeRoute.layout === 'public') {
    return <Outlet />
  }

  const canAccessActiveRoute = canAccessRouteWithContext(viewer, activeRoute, {
    defaultClientId: runtime.defaultClientId,
    routeParams,
  })

  if (!canAccessActiveRoute) {
    return <Outlet />
  }

  const accessibleRoutes = filterRoutesForNavigation({
    defaultClientId: runtime.defaultClientId,
    navigationScope: getDefaultNavigationScopeForViewer(viewer),
    viewer,
    routeParams,
    routes: routeMetadata,
  })

  return (
    <AppShell
      activeRoute={activeRoute}
      onAuthChange={onAuthChange}
      onSignOut={onSignOut}
      routeParams={routeParams}
      runtime={runtime}
      sidebarViewerMeta={getSidebarViewerMeta(viewer)}
      routes={accessibleRoutes}
    >
      <Outlet />
    </AppShell>
  )
}
