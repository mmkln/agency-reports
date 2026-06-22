import {
  hasAgencyAdminMembership,
  hasAgencyMembership,
  hasWorkspaceMembership,
} from '../../domain/policies/routeAccessPolicy'

export function getClientPageMode(viewer) {
  return hasAgencyAdminMembership(viewer) ? 'admin_preview' : 'client'
}

export function canRecordClientPortalActivity(viewer) {
  return hasWorkspaceMembership(viewer) && !hasAgencyMembership(viewer)
}
