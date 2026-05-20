import {
  isActiveProfile,
  isClientPortalRole,
  PROFILE_STATUSES,
  USER_ROLES,
} from '../../entities/profile'
import {
  CLIENT_MEMBERSHIP_ROLES,
  isActiveClientMembership,
} from '../../entities/client-membership'

function requireAuthenticatedViewer(viewer) {
  if (!viewer?.userId) {
    throw new Error('You must be signed in to manage account lifecycle.')
  }
}

function getOwnProfile({ repositories, viewer }) {
  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile || !isActiveProfile(profile)) {
    throw new Error('Profile was not found.')
  }

  return profile
}

function assertNotLastAgencyAdmin({ profile, repositories }) {
  if (profile.role !== USER_ROLES.AGENCY_ADMIN) {
    return
  }

  const activeAgencyAdminCount = repositories.profiles
    .list()
    .filter((candidate) => (
      candidate.agency_id === profile.agency_id
      && candidate.role === USER_ROLES.AGENCY_ADMIN
      && isActiveProfile(candidate)
    ))
    .length

  if (activeAgencyAdminCount <= 1) {
    throw new Error('Another agency admin is required before deactivating this account.')
  }
}

function getActiveMembershipsForProfile({ repositories, userId }) {
  return repositories.clientMemberships
    .list()
    .filter(isActiveClientMembership)
    .filter((membership) => membership.user_id === userId)
}

function countActiveOwners({ clientId, repositories }) {
  return repositories.clientMemberships
    .listByClientId(clientId)
    .filter(isActiveClientMembership)
    .filter((membership) => {
      if (membership.role !== CLIENT_MEMBERSHIP_ROLES.OWNER) {
        return false
      }

      const profile = repositories.profiles.findByUserId(membership.user_id)

      return isActiveProfile(profile)
    })
    .length
}

function assertClientOwnershipCanSurviveDeactivation({ repositories, viewer }) {
  if (!isClientPortalRole(viewer.role)) {
    return
  }

  const ownedMembership = getActiveMembershipsForProfile({
    repositories,
    userId: viewer.userId,
  }).find((membership) => membership.role === CLIENT_MEMBERSHIP_ROLES.OWNER)

  if (!ownedMembership) {
    return
  }

  if (countActiveOwners({
    clientId: ownedMembership.client_id,
    repositories,
  }) <= 1) {
    throw new Error('Transfer workspace ownership before deactivating this account.')
  }
}

export function deactivateOwnProfile({
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = getOwnProfile({ repositories, viewer })

  assertNotLastAgencyAdmin({ profile, repositories })
  assertClientOwnershipCanSurviveDeactivation({ repositories, viewer })

  const timestamp = now()

  return repositories.profiles.upsert({
    ...profile,
    deactivated_at: timestamp,
    deactivated_by: viewer.userId,
    status: PROFILE_STATUSES.INACTIVE,
    updated_at: timestamp,
  })
}
