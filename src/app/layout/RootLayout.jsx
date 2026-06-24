import { matchPath, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { ROUTE_PATHS } from '../../domain/navigation/routePaths'

const legacyHashRouteMap = Object.freeze({
  '#client-dashboard': ROUTE_PATHS.portalGrowthReview,
  '#client-overview': ROUTE_PATHS.portalGrowthReview,
  '#client-performance': ROUTE_PATHS.portalGrowthReview,
  '#growth-review': ROUTE_PATHS.portalGrowthReview,
  '#settings': ROUTE_PATHS.portalGrowthReview,
  '#client-settings': ROUTE_PATHS.portalGrowthReview,
  '#dashboard': ROUTE_PATHS.portalGrowthReview,
  '#executive': ROUTE_PATHS.portalExecutive,
  '#executive-dashboard': ROUTE_PATHS.portalExecutive,
  '#performance': ROUTE_PATHS.portalGrowthReview,
  '#performance-dashboard': ROUTE_PATHS.portalGrowthReview,
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
  const params = useParams()
  const [searchParams] = useSearchParams()
  const routeParams = {
    ...params,
    ...Object.fromEntries(searchParams.entries()),
  }
  const activeRoute = routeMetadata.find((route) => (
    matchPath({ end: true, path: route.path }, location.pathname)
  )) ?? routeMetadata[0]

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
