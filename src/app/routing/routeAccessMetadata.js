import { matchPath } from 'react-router-dom'

import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import { ROUTE_PATHS } from '../../domain/navigation/routePaths'
import { ROUTE_ACCESS_SCOPES } from './roleAccess'

const {
  ACCOUNT,
  AGENCY,
  PUBLIC,
  WORKSPACE,
} = ROUTE_ACCESS_SCOPES

export const routeAccessMetadata = Object.freeze([
  {
    id: 'landing',
    layout: 'public',
    path: '/',
    redirectAuthenticated: true,
    access: { scope: PUBLIC },
  },
  {
    id: 'accept-invite',
    layout: 'auth',
    path: '/accept-invite',
    access: { scope: PUBLIC },
  },
  {
    id: 'login',
    layout: 'auth',
    path: '/login',
    redirectAuthenticated: true,
    access: { scope: PUBLIC },
  },
  {
    id: 'access-denied',
    layout: 'auth',
    path: '/access-denied',
    access: { scope: PUBLIC },
  },
  {
    id: 'account-settings',
    path: ROUTE_PATHS.accountSettings,
    access: { scope: ACCOUNT },
  },
  {
    id: 'admin-clients',
    path: ROUTE_PATHS.agencyClients,
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-client-detail',
    path: ROUTE_PATHS.agencyClientDetail,
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-workspaces',
    path: ROUTE_PATHS.agencyWorkspaces,
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-client-access',
    path: ROUTE_PATHS.agencyClientAccess,
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS,
      scope: AGENCY,
    },
  },
  {
    id: 'dental-growth-review',
    path: ROUTE_PATHS.portalGrowthReview,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW,
      scope: WORKSPACE,
      workspaceCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    },
  },
  {
    id: 'client-settings',
    path: ROUTE_PATHS.portalSettings,
    access: {
      scope: WORKSPACE,
      workspaceCapability: WORKSPACE_CAPABILITIES.MANAGE_SETTINGS,
    },
  },
])

export const routeAccessMetadataById = Object.freeze(Object.fromEntries(
  routeAccessMetadata.map((route) => [route.id, route]),
))

export function findRouteAccessMetadataByPath(pathname) {
  return routeAccessMetadata.find((route) => (
    matchPath({ end: true, path: route.path }, pathname)
  )) ?? null
}
