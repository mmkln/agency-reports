import {
  hasAgencyAdminMembership,
  hasAgencyMembership,
} from '@/domain/policies/routeAccessPolicy'

export function isAgencyTeamTaskCreator(viewer) {
  return hasAgencyMembership(viewer) && !hasAgencyAdminMembership(viewer)
}
