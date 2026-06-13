import {
  CLINIC_REPORTING_CAPABILITIES,
} from '../../entities/profile'
import { AGENCY_CAPABILITIES, AGENCY_ROLES } from '../../entities/agency-membership'
import {
  getPortalWorkspaceReviewPath,
  ROUTE_PATHS,
  withSearchParams,
} from '../navigation/routePaths'

export function getHomeHrefForViewer(viewer) {
  if (!viewer) {
    return '/login'
  }

  const agencyMembership = (viewer.agencyMemberships ?? [])[0] ?? null
  const agencyRole = agencyMembership?.role ?? null

  if (
    [AGENCY_ROLES.OWNER, AGENCY_ROLES.ADMIN, AGENCY_ROLES.MANAGER].includes(agencyRole)
    && (agencyMembership.capabilities ?? []).includes(AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS)
  ) {
    return ROUTE_PATHS.agencyClients
  }

  if (agencyRole) {
    return ROUTE_PATHS.accountSettings
  }

  const growthReviewWorkspaceMembership = (viewer.workspaceMemberships ?? [])
    .find((membership) => (
      (membership.capabilities ?? []).includes(CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW)
    ))

  if (growthReviewWorkspaceMembership) {
    return getPortalWorkspaceReviewPath(growthReviewWorkspaceMembership.workspaceId)
  }

  const fallbackWorkspaceId = viewer.activeWorkspaceId ?? viewer.workspaceMemberships?.[0]?.workspaceId ?? null

  return fallbackWorkspaceId
    ? withSearchParams(ROUTE_PATHS.portalSettings, { clientId: fallbackWorkspaceId })
    : ROUTE_PATHS.accountSettings
}
