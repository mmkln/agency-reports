import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { setAuthSession } from './authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage client invitations.')
  }
}

function createToken(idGenerator) {
  return idGenerator().replace(/-/g, '')
}

function assertClientBelongsToAgency({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found.')
  }

  return client
}

function normalizeRole(role) {
  const normalizedRole = role || CLIENT_MEMBERSHIP_ROLES.OWNER

  if (!Object.values(CLIENT_MEMBERSHIP_ROLES).includes(normalizedRole)) {
    throw new Error('Invitation role is invalid.')
  }

  return normalizedRole
}

export function getInvitationStatus(invitation, now = () => new Date().toISOString()) {
  if (!invitation) {
    return CLIENT_INVITATION_STATUSES.CANCELLED
  }

  if (invitation.status !== CLIENT_INVITATION_STATUSES.PENDING) {
    return invitation.status
  }

  if (!invitation.expires_at) {
    return invitation.status
  }

  const expiresAt = new Date(invitation.expires_at).getTime()
  const currentTime = new Date(now()).getTime()

  if (Number.isNaN(expiresAt) || Number.isNaN(currentTime)) {
    return invitation.status
  }

  return expiresAt < currentTime
    ? CLIENT_INVITATION_STATUSES.EXPIRED
    : invitation.status
}

function assertInvitationIsPending(invitation, now) {
  const status = getInvitationStatus(invitation, now)

  if (status === CLIENT_INVITATION_STATUSES.ACCEPTED) {
    throw new Error('Invitation was already accepted.')
  }

  if (status === CLIENT_INVITATION_STATUSES.CANCELLED) {
    throw new Error('Invitation was cancelled.')
  }

  if (status === CLIENT_INVITATION_STATUSES.EXPIRED) {
    throw new Error('Invitation has expired.')
  }

  if (status !== CLIENT_INVITATION_STATUSES.PENDING) {
    throw new Error('Invitation is no longer active.')
  }
}

function mapInvitation(invitation, now) {
  return {
    ...invitation,
    status: getInvitationStatus(invitation, now),
  }
}

export function createClientInvitation({
  clientId,
  email,
  expiresAt = null,
  idGenerator,
  name = '',
  now = () => new Date().toISOString(),
  repositories,
  role = CLIENT_MEMBERSHIP_ROLES.OWNER,
  viewer,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const client = assertClientBelongsToAgency({ clientId, repositories, viewer })

  const normalizedEmail = normalizeEmail(email)
  const timestamp = now()
  const invitation = {
    accepted_at: null,
    client_id: client.id,
    created_at: timestamp,
    email: normalizedEmail,
    expires_at: expiresAt || null,
    id: idGenerator(),
    invited_by: viewer.userId,
    name: String(name ?? '').trim(),
    role: normalizeRole(role),
    status: CLIENT_INVITATION_STATUSES.PENDING,
    token: createToken(idGenerator),
    updated_at: timestamp,
  }

  repositories.clientInvitations.upsert(invitation)

  return invitation
}

export function listClientInvitations({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertClientBelongsToAgency({ clientId, repositories, viewer })

  return repositories.clientInvitations
    .listByClientId(clientId)
    .map((invitation) => mapInvitation(invitation, now))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getClientInvitationByToken({ repositories, token }) {
  const normalizedToken = requireText(token, 'Invitation token')
  const invitation = repositories.clientInvitations
    .list()
    .find((item) => item.token === normalizedToken)

  if (!invitation) {
    throw new Error('Invitation was not found.')
  }

  const client = repositories.clients.findById(invitation.client_id)

  if (!client) {
    throw new Error('Invitation client was not found.')
  }

  return { client, invitation }
}

export function cancelClientInvitation({
  invitationId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const invitation = repositories.clientInvitations.findById(invitationId)

  if (!invitation) {
    throw new Error('Invitation was not found.')
  }

  assertClientBelongsToAgency({
    clientId: invitation.client_id,
    repositories,
    viewer,
  })

  const status = getInvitationStatus(invitation, now)

  if (status === CLIENT_INVITATION_STATUSES.ACCEPTED) {
    throw new Error('Accepted invitations cannot be cancelled.')
  }

  const nextInvitation = {
    ...invitation,
    status: CLIENT_INVITATION_STATUSES.CANCELLED,
    updated_at: now(),
  }

  repositories.clientInvitations.upsert(nextInvitation)

  return mapInvitation(nextInvitation, now)
}

export function acceptClientInvitation({
  email,
  idGenerator,
  name,
  now = () => new Date().toISOString(),
  repositories,
  storage = typeof window !== 'undefined' ? window.localStorage : null,
  token,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const { client, invitation } = getClientInvitationByToken({ repositories, token })

  try {
    assertInvitationIsPending(invitation, now)
  } catch (caughtError) {
    if (getInvitationStatus(invitation, now) === CLIENT_INVITATION_STATUSES.EXPIRED) {
      repositories.clientInvitations.upsert({
        ...invitation,
        status: CLIENT_INVITATION_STATUSES.EXPIRED,
        updated_at: now(),
      })
    }

    throw caughtError
  }

  const normalizedEmail = normalizeEmail(email || invitation.email)

  if (normalizedEmail !== invitation.email.toLowerCase()) {
    throw new Error('Email does not match this invitation.')
  }

  const normalizedName = requireText(name || invitation.name || client.primary_contact_name, 'Name')
  const timestamp = now()
  const existingProfile = repositories.profiles
    .list()
    .find((profile) => profile.email.toLowerCase() === normalizedEmail)
  const profile = existingProfile ?? {
    agency_id: client.agency_id,
    client_id: client.id,
    created_at: timestamp,
    email: normalizedEmail,
    id: idGenerator(),
    name: normalizedName,
    role: USER_ROLES.CLIENT_USER,
    updated_at: timestamp,
    user_id: idGenerator(),
  }

  repositories.profiles.upsert({
    ...profile,
    agency_id: client.agency_id,
    client_id: client.id,
    name: normalizedName,
    role: USER_ROLES.CLIENT_USER,
    updated_at: timestamp,
  })

  const existingMembership = repositories.clientMemberships
    .list()
    .find((membership) => membership.client_id === client.id && membership.user_id === profile.user_id)

  if (!existingMembership) {
    repositories.clientMemberships.upsert({
      client_id: client.id,
      created_at: timestamp,
      id: idGenerator(),
      role: invitation.role || CLIENT_MEMBERSHIP_ROLES.VIEWER,
      updated_at: timestamp,
      user_id: profile.user_id,
    })
  }

  repositories.clientInvitations.upsert({
    ...invitation,
    accepted_at: timestamp,
    status: CLIENT_INVITATION_STATUSES.ACCEPTED,
    updated_at: timestamp,
  })

  setAuthSession(profile.user_id, storage)

  return {
    client,
    profile: repositories.profiles.findByUserId(profile.user_id),
  }
}
