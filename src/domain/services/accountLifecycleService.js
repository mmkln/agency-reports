import {
  AGENCY_ROLES,
  isActiveAgencyMembership,
} from '../../entities/agency-membership'
import {
  isActiveWorkspaceMembership,
  WORKSPACE_ROLES,
} from '../../entities/workspace-membership'
import {
  isActiveProfile,
  PROFILE_STATUSES,
} from '../../entities/profile'

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

function isAgencyAdminRole(role) {
  return role === AGENCY_ROLES.OWNER || role === AGENCY_ROLES.ADMIN
}

function getActiveAgencyMembershipsForUser({ repositories, userId }) {
  return repositories.agencyMemberships
    .list()
    .filter(isActiveAgencyMembership)
    .filter((membership) => membership.user_id === userId)
}

function countActiveAgencyAdmins({ agencyId, repositories }) {
  return repositories.agencyMemberships
    .list()
    .filter(isActiveAgencyMembership)
    .filter((membership) => (
      membership.agency_id === agencyId
      && isAgencyAdminRole(membership.role)
      && isActiveProfile(repositories.profiles.findByUserId(membership.user_id))
    ))
    .length
}

function assertNotLastAgencyAdmin({ profile, repositories }) {
  const agencyMemberships = getActiveAgencyMembershipsForUser({
    repositories,
    userId: profile.user_id,
  })
  const adminAgencyMembership = agencyMemberships.find((membership) => isAgencyAdminRole(membership.role))

  if (adminAgencyMembership) {
    const activeAgencyAdminCount = countActiveAgencyAdmins({
      agencyId: adminAgencyMembership.agency_id,
      repositories,
    })

    if (activeAgencyAdminCount <= 1) {
      throw new Error('Another agency admin is required before deactivating this account.')
    }

    return
  }
}

function getActiveMembershipsForProfile({ repositories, userId }) {
  return repositories.workspaceMemberships
    .list()
    .filter(isActiveWorkspaceMembership)
    .filter((membership) => membership.user_id === userId)
}

function countActiveOwners({ clientId, repositories }) {
  return repositories.workspaceMemberships
    .listByWorkspaceId(clientId)
    .filter(isActiveWorkspaceMembership)
    .filter((membership) => {
      if (membership.role !== WORKSPACE_ROLES.OWNER) {
        return false
      }

      const profile = repositories.profiles.findByUserId(membership.user_id)

      return isActiveProfile(profile)
    })
    .length
}

function assertClientOwnershipCanSurviveDeactivation({ repositories, viewer }) {
  const ownedMembership = getActiveMembershipsForProfile({
    repositories,
    userId: viewer.userId,
  }).find((membership) => membership.role === WORKSPACE_ROLES.OWNER)

  if (!ownedMembership) {
    return
  }

  if (countActiveOwners({
    clientId: ownedMembership.workspace_id,
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
