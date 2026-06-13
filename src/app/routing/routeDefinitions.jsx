/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LEGACY_ROUTE_REDIRECTS, ROUTE_PATHS } from '../../domain/navigation/routePaths'
import { AcceptInvitePage } from '../../pages/auth/accept-invite/AcceptInvitePage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminWorkspacesPageHeader } from '../../pages/admin/workspaces/AdminWorkspacesPageHeader'
import { DentalGrowthReviewPageHeader } from '../../pages/dashboards/dental-growth-review/DentalGrowthReviewPageHeader'
import { LoginPage } from '../../pages/auth/login/LoginPage'
import { AccessDeniedPage } from '../../pages/system/access-denied/AccessDeniedPage'
import { AuthLayout } from '../layout/AuthLayout'
import { AuthenticatedRedirectRoute } from './AuthenticatedRedirectRoute'
import { NAVIGATION_SCOPES, ROUTE_ACCESS_SCOPES } from './roleAccess'
import { ProtectedRoute } from './ProtectedRoute'
import { routeAccessMetadataById } from './routeAccessMetadata'
import {
  AccountSettingsPageRoute,
  AdminClientAccessPageRoute,
  AdminClientDetailPageRoute,
  AdminClientsPageRoute,
  AdminClinicDataSourcesPageRoute,
  AdminClinicReviewPageRoute,
  AdminClinicReviewSetupPageRoute,
  AdminClinicSetupPageRoute,
  AdminWorkspacesPageRoute,
  ClientSettingsPageRoute,
  DentalGrowthReviewPageRoute,
} from './RoutePages'

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>
const {
  AGENCY,
  CLIENT_PORTAL,
} = NAVIGATION_SCOPES

function LegacyRouteRedirect({ to }) {
  const location = useLocation()

  return <Navigate replace to={`${to}${location.search}${location.hash}`} />
}

export const routeDefinitions = [
  {
    path: '/',
    id: 'landing',
    label: 'Landing',
    layout: 'public',
    redirectAuthenticated: routeAccessMetadataById.landing.redirectAuthenticated,
    access: routeAccessMetadataById.landing.access,
    showInNav: false,
    element: <Navigate replace to="/login" />,
  },
  {
    path: '/accept-invite',
    id: 'accept-invite',
    label: 'Accept Invite',
    layout: 'auth',
    access: routeAccessMetadataById['accept-invite'].access,
    showInNav: false,
    element: <AcceptInvitePage />,
  },
  {
    path: '/login',
    id: 'login',
    label: 'Login',
    layout: 'auth',
    redirectAuthenticated: routeAccessMetadataById.login.redirectAuthenticated,
    access: routeAccessMetadataById.login.access,
    showInNav: false,
    element: <LoginPage />,
  },
  {
    path: '/access-denied',
    id: 'access-denied',
    label: 'Access Denied',
    layout: 'auth',
    access: routeAccessMetadataById['access-denied'].access,
    showInNav: false,
    element: <AccessDeniedPage />,
  },
  {
    path: '/account/settings',
    id: 'account-settings',
    label: 'Settings',
    pageTitle: 'Account Settings',
    access: routeAccessMetadataById['account-settings'].access,
    contentWidth: 'content',
    iconName: 'settings',
    navigationScope: AGENCY,
    navOrder: 20,
    showInNav: false,
    element: <AccountSettingsPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClients,
    id: 'admin-clients',
    label: 'Clients',
    pageTitle: 'Clients',
    access: routeAccessMetadataById['admin-clients'].access,
    header: AdminClientsPageHeader,
    iconName: 'users',
    navigationScope: AGENCY,
    navOrder: 10,
    element: <AdminClientsPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClientDetail,
    id: 'admin-client-detail',
    label: 'Client',
    pageTitle: 'Client',
    access: routeAccessMetadataById['admin-client-detail'].access,
    hidePageHeader: true,
    iconName: 'users',
    showInNav: false,
    element: <AdminClientDetailPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyWorkspaces,
    id: 'admin-workspaces',
    label: 'Workspaces',
    pageTitle: 'Workspaces',
    access: routeAccessMetadataById['admin-workspaces'].access,
    header: AdminWorkspacesPageHeader,
    iconName: 'grid',
    navigationScope: AGENCY,
    navOrder: 11,
    element: <AdminWorkspacesPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClientAccess,
    id: 'admin-client-access',
    label: 'Access',
    pageTitle: 'Client Access',
    access: routeAccessMetadataById['admin-client-access'].access,
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'users',
    element: <AdminClientAccessPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClinicSetup,
    id: 'admin-clinic-setup',
    label: 'Setup',
    pageTitle: 'Setup',
    access: routeAccessMetadataById['admin-clinic-setup'].access,
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'stethoscope',
    element: <AdminClinicSetupPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClinicDataSources,
    id: 'admin-clinic-data-sources',
    label: 'Data Sources',
    pageTitle: 'Data Sources',
    access: routeAccessMetadataById['admin-clinic-data-sources'].access,
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'database',
    element: <AdminClinicDataSourcesPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClinicReview,
    id: 'admin-clinic-review',
    label: 'Review',
    pageTitle: 'Review',
    access: routeAccessMetadataById['admin-clinic-review'].access,
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'trendingUp',
    element: <AdminClinicReviewPageRoute />,
  },
  {
    path: ROUTE_PATHS.agencyClinicReviewSetup,
    id: 'admin-clinic-review-setup',
    label: 'Review Setup',
    pageTitle: 'Review Setup',
    access: routeAccessMetadataById['admin-clinic-review-setup'].access,
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'settings',
    element: <AdminClinicReviewSetupPageRoute />,
  },
  {
    path: ROUTE_PATHS.portalGrowthReview,
    id: 'dental-growth-review',
    label: 'Growth Review',
    pageTitle: 'Growth Review',
    access: routeAccessMetadataById['dental-growth-review'].access,
    contentWidth: 'content',
    header: DentalGrowthReviewPageHeader,
    iconName: 'trendingUp',
    navLabel: 'Growth Review',
    navigationScope: CLIENT_PORTAL,
    navOrder: 10,
    element: <DentalGrowthReviewPageRoute />,
  },
  {
    path: ROUTE_PATHS.portalSettings,
    id: 'client-settings',
    label: 'Settings',
    pageTitle: 'Settings',
    access: routeAccessMetadataById['client-settings'].access,
    contentWidth: 'content',
    iconName: 'settings',
    navigationScope: CLIENT_PORTAL,
    navOrder: 20,
    showInNav: false,
    element: <ClientSettingsPageRoute />,
  },
  ...Object.entries(LEGACY_ROUTE_REDIRECTS).map(([legacyPath, nextPath]) => ({
    path: legacyPath,
    id: `legacy:${legacyPath}`,
    label: 'Legacy Redirect',
    layout: 'public',
    access: { scope: ROUTE_ACCESS_SCOPES.PUBLIC },
    isLegacyRedirect: true,
    showInNav: false,
    element: <LegacyRouteRedirect to={nextPath} />,
  })),
]

export const routeMetadata = routeDefinitions.map((route) => {
  const metadata = { ...route }
  delete metadata.element

  return metadata
})

function getRoutePath(path) {
  return path === '/' ? undefined : path.replace(/^\//, '')
}

function buildRouteElement(route) {
  const routeElement = route.layout === 'auth'
    ? <AuthLayout>{route.element}</AuthLayout>
    : <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>

  if (!route.access?.scope || route.access.scope === ROUTE_ACCESS_SCOPES.PUBLIC) {
    return route.redirectAuthenticated
      ? (
          <AuthenticatedRedirectRoute route={route}>
            {routeElement}
          </AuthenticatedRedirectRoute>
        )
      : routeElement
  }

  return (
    <ProtectedRoute route={route}>
      {routeElement}
    </ProtectedRoute>
  )
}

export function createRouteChildren() {
  return routeDefinitions.map((route) => {
    const element = buildRouteElement(route)

    if (route.path === '/') {
      return { index: true, element }
    }

    return {
      path: getRoutePath(route.path),
      element,
    }
  })
}
