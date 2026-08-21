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
    id: 'forgot-password',
    layout: 'auth',
    path: '/forgot-password',
    access: { scope: PUBLIC },
  },
  {
    id: 'reset-password',
    layout: 'auth',
    path: '/reset-password',
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
    id: 'agency-workspace-detail',
    path: ROUTE_PATHS.agencyWorkspaceDetail,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-setup',
    path: ROUTE_PATHS.agencyWorkspaceSetup,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-data',
    path: ROUTE_PATHS.agencyWorkspaceData,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_INTEGRATIONS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-tag-catalog',
    path: ROUTE_PATHS.agencyWorkspaceTagCatalog,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_INTEGRATIONS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-review-setup',
    path: ROUTE_PATHS.agencyWorkspaceReviewSetup,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_INTEGRATIONS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-review',
    path: ROUTE_PATHS.agencyWorkspaceReview,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-executive',
    path: ROUTE_PATHS.agencyWorkspaceExecutive,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW,
      scope: WORKSPACE,
    },
  },
  {
    id: 'agency-workspace-access',
    path: ROUTE_PATHS.agencyWorkspaceAccess,
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS,
      scope: WORKSPACE,
    },
  },
  {
    id: 'portal-home',
    path: ROUTE_PATHS.portalHome,
    access: { scope: ACCOUNT },
  },
  {
    id: 'portal-workspace-detail',
    path: ROUTE_PATHS.portalWorkspaceDetail,
    access: {
      scope: WORKSPACE,
      workspaceCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    },
  },
  {
    id: 'portal-workspace-review',
    path: ROUTE_PATHS.portalWorkspaceReview,
    access: {
      scope: WORKSPACE,
      workspaceCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    },
  },
  {
    id: 'portal-workspace-executive',
    path: ROUTE_PATHS.portalWorkspaceExecutive,
    access: {
      scope: WORKSPACE,
      workspaceCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
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
    id: 'executive-dashboard',
    path: ROUTE_PATHS.portalExecutive,
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
