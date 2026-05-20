import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { isClientPortalRole, USER_ROLES } from '../../entities/profile'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_MEMBERSHIP_ROLES = new Set(Object.values(CLIENT_MEMBERSHIP_ROLES))

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage client members.')
  }
}

function getAdminClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found.')
  }

  return client
}

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeEmail(value) {
  const email = requireText(value, 'Email').toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Email must be a valid email address.')
  }

  return email
}

function normalizeRole(role) {
  const normalizedRole = role || CLIENT_MEMBERSHIP_ROLES.VIEWER

  if (!VALID_MEMBERSHIP_ROLES.has(normalizedRole)) {
    throw new Error('Membership role is invalid.')
  }

  return normalizedRole
}

function mapMember({ membership, profile }) {
  return {
    clientId: membership.client_id,
    email: profile?.email ?? '',
    id: membership.id,
    name: profile?.name ?? 'Unknown member',
    role: membership.role,
    userId: membership.user_id,
  }
}

export function listClientMembers({ clientId, repositories, viewer }) {
  getAdminClient({ clientId, repositories, viewer })

  return repositories.clientMemberships
    .listByClientId(clientId)
    .map((membership) => mapMember({
      membership,
      profile: repositories.profiles.findByUserId(membership.user_id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email))
}

export function addClientMember({
  clientId,
  email,
  idGenerator,
  name,
  now = () => new Date().toISOString(),
  repositories,
  role = CLIENT_MEMBERSHIP_ROLES.VIEWER,
  viewer,
}) {
  const client = getAdminClient({ clientId, repositories, viewer })

  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const normalizedEmail = normalizeEmail(email)
  const normalizedName = requireText(name, 'Name')
  const normalizedRole = normalizeRole(role)
  const timestamp = now()
  const existingProfile = repositories.profiles
    .list()
    .find((profile) => profile.email.toLowerCase() === normalizedEmail)

  if (existingProfile && !isClientPortalRole(existingProfile.role)) {
    throw new Error('This email belongs to a non-client user.')
  }

  const profile = existingProfile ?? {
    agency_id: client.agency_id,
    client_id: client.id,
    created_at: timestamp,
    email: normalizedEmail,
    id: idGenerator(),
    name: normalizedName,
    role: normalizedRole === CLIENT_MEMBERSHIP_ROLES.OWNER ? USER_ROLES.CLIENT_ADMIN : USER_ROLES.CLIENT_TEAM,
    updated_at: timestamp,
    user_id: idGenerator(),
  }

  repositories.profiles.upsert({
    ...profile,
    agency_id: client.agency_id,
    name: normalizedName,
    role: existingProfile?.role ?? (normalizedRole === CLIENT_MEMBERSHIP_ROLES.OWNER ? USER_ROLES.CLIENT_ADMIN : USER_ROLES.CLIENT_TEAM),
    updated_at: timestamp,
  })

  const existingMembership = repositories.clientMemberships
    .listByClientId(clientId)
    .find((membership) => membership.user_id === profile.user_id)

  if (existingMembership) {
    throw new Error('This user already has access to the client.')
  }

  const membership = repositories.clientMemberships.upsert({
    client_id: clientId,
    created_at: timestamp,
    id: idGenerator(),
    role: normalizedRole,
    updated_at: timestamp,
    user_id: profile.user_id,
  })

  return mapMember({
    membership,
    profile: repositories.profiles.findByUserId(profile.user_id),
  })
}

export function updateClientMembershipRole({
  membershipId,
  now = () => new Date().toISOString(),
  repositories,
  role,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const membership = repositories.clientMemberships.findById(membershipId)

  if (!membership) {
    throw new Error('Membership was not found.')
  }

  getAdminClient({ clientId: membership.client_id, repositories, viewer })

  const updatedMembership = repositories.clientMemberships.upsert({
    ...membership,
    role: normalizeRole(role),
    updated_at: now(),
  })

  return mapMember({
    membership: updatedMembership,
    profile: repositories.profiles.findByUserId(updatedMembership.user_id),
  })
}

export function removeClientMembership({
  membershipId,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const membership = repositories.clientMemberships.findById(membershipId)

  if (!membership) {
    throw new Error('Membership was not found.')
  }

  getAdminClient({ clientId: membership.client_id, repositories, viewer })

  return repositories.clientMemberships.deleteById(membershipId)
}
