import { CLIENT_TYPES } from '../../entities/client'
import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
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
    path: '/account/settings',
    access: { scope: ACCOUNT },
  },
  {
    id: 'admin-clients',
    path: '/admin/clients',
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-workspaces',
    path: '/admin/workspaces',
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-client-access',
    path: '/admin/client-access',
    access: {
      capability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS,
      scope: AGENCY,
    },
  },
  {
    id: 'admin-clinic-setup',
    path: '/admin/clinic-setup',
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
      scope: WORKSPACE,
      workspaceTypes: [CLIENT_TYPES.CLINIC],
    },
  },
  {
    id: 'admin-clinic-data-sources',
    path: '/admin/clinic-data-sources',
    access: {
      agencyCapability: AGENCY_CAPABILITIES.MANAGE_INTEGRATIONS,
      scope: WORKSPACE,
      workspaceTypes: [CLIENT_TYPES.CLINIC],
    },
  },
  {
    id: 'dental-growth-review',
    path: '/client/growth-review',
    access: {
      agencyCapability: AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW,
      scope: WORKSPACE,
      workspaceCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
      workspaceTypes: [CLIENT_TYPES.CLINIC],
    },
  },
  {
    id: 'client-settings',
    path: '/client/settings',
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
  return routeAccessMetadata.find((route) => route.path === pathname) ?? null
}
