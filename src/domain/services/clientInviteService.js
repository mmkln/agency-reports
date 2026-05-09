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
    throw new Error('Only agency admins can create client invitations.')
  }
}

function createToken(idGenerator) {
  return idGenerator().replace(/-/g, '')
}

export function createClientInvitation({
  clientId,
  email,
  idGenerator,
  name = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found.')
  }

  const normalizedEmail = normalizeEmail(email)
  const timestamp = now()
  const invitation = {
    accepted_at: null,
    client_id: client.id,
    created_at: timestamp,
    email: normalizedEmail,
    expires_at: null,
    id: idGenerator(),
    invited_by: viewer.userId,
    name: String(name ?? '').trim(),
    role: CLIENT_MEMBERSHIP_ROLES.OWNER,
    status: CLIENT_INVITATION_STATUSES.PENDING,
    token: createToken(idGenerator),
    updated_at: timestamp,
  }

  repositories.clientInvitations.upsert(invitation)

  return invitation
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

export function acceptClientInvitation({
  email,
  idGenerator,
  name,
  now = () => new Date().toISOString(),
  repositories,
  storage = window.localStorage,
  token,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const { client, invitation } = getClientInvitationByToken({ repositories, token })

  if (invitation.status !== CLIENT_INVITATION_STATUSES.PENDING) {
    throw new Error('Invitation is no longer active.')
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
