import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import {
  getWorkspaceRoleDefaultCapabilities,
  WORKSPACE_ROLES,
} from '../../entities/workspace-membership'
import { canAccessWorkspaceResource } from '../policies/accessPolicy'
import { assertCanManageClientTeam } from '../policies/clientTeamPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'
import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from './activityTrackingService'
import { createPasswordCredential, validatePasswordPair } from './authCredentialService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVITATION_ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15
const INVITATION_ACCESS_TOKEN_STATUSES = Object.freeze({
  EXPIRED: 'expired',
  PENDING: 'pending',
  USED: 'used',
})
export const INVITATION_ACCESS_LINK_SENT_MESSAGE = 'If an invitation exists for that email, we sent a secure link.'

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
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can manage workspace invitations.')
  }
}

function createToken(idGenerator) {
  return idGenerator().replace(/-/g, '')
}

function createExpiresAt(now, ttlMs) {
  return new Date(new Date(now()).getTime() + ttlMs).toISOString()
}

function isPastDate(value, now) {
  const expiresAt = new Date(value).getTime()
  const currentTime = new Date(now()).getTime()

  return !Number.isNaN(expiresAt) && !Number.isNaN(currentTime) && expiresAt < currentTime
}

function assertClientBelongsToAgency({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessWorkspaceResource(viewer, client.id)) {
    throw new Error('Client was not found.')
  }

  return client
}

function normalizeRole(role) {
  const normalizedRole = role || WORKSPACE_ROLES.OWNER

  if (!Object.values(WORKSPACE_ROLES).includes(normalizedRole)) {
    throw new Error('Invitation role is invalid.')
  }

  return normalizedRole
}

function normalizeClientTeamInviteRole(role) {
  const normalizedRole = role || WORKSPACE_ROLES.VIEWER

  if (normalizedRole !== WORKSPACE_ROLES.VIEWER) {
    throw new Error('Client admins can invite teammates as viewers only.')
  }

  return normalizedRole
}

function createInvitationAcceptedActivityViewer({ client, invitation, profile }) {
  const workspaceRole = invitation.role || WORKSPACE_ROLES.VIEWER

  return {
    activeWorkspaceId: client.id,
    agencyMemberships: [],
    capabilities: getWorkspaceRoleDefaultCapabilities(workspaceRole),
    managedWorkspaceRelationships: [],
    name: profile.name,
    userId: profile.user_id,
    workspaceMemberships: [{
      capabilities: getWorkspaceRoleDefaultCapabilities(workspaceRole),
      role: workspaceRole,
      userId: profile.user_id,
      workspaceId: client.id,
    }],
  }
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

function recordInvitationActivity({
  activityIdGenerator,
  eventType,
  invitation,
  now,
  repositories,
  viewer,
}) {
  if (!activityIdGenerator || !repositories.activityEvents) {
    return null
  }

  return recordActivityEvent({
    clientId: invitation.client_id,
    eventType,
    idGenerator: activityIdGenerator,
    metadata: {
      email: invitation.email,
      invitationId: invitation.id,
      role: invitation.role,
      status: invitation.status,
    },
    now,
    repositories,
    viewer,
  })
}

export function createClientInvitation({
  activityIdGenerator,
  clientId,
  email,
  expiresAt = null,
  idGenerator,
  name = '',
  now = () => new Date().toISOString(),
  repositories,
  role = WORKSPACE_ROLES.OWNER,
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

  repositories.workspaceInvitations.upsert(invitation)
  recordInvitationActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CREATED,
    invitation,
    now,
    repositories,
    viewer,
  })

  return invitation
}

export function listClientInvitations({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertClientBelongsToAgency({ clientId, repositories, viewer })

  return repositories.workspaceInvitations
    .listByWorkspaceId(clientId)
    .map((invitation) => mapInvitation(invitation, now))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function listClientTeamInvitations({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertCanManageClientTeam({ clientId, repositories, viewer })

  return repositories.workspaceInvitations
    .listByWorkspaceId(clientId)
    .map((invitation) => mapInvitation(invitation, now))
    .filter((invitation) => invitation.status === CLIENT_INVITATION_STATUSES.PENDING)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function createClientTeamInvitation({
  activityIdGenerator,
  clientId,
  email,
  expiresAt = null,
  idGenerator,
  name = '',
  now = () => new Date().toISOString(),
  repositories,
  role = WORKSPACE_ROLES.VIEWER,
  viewer,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  assertCanManageClientTeam({ clientId, repositories, viewer })

  const client = repositories.workspaces.findById(clientId)
  const normalizedEmail = normalizeEmail(email)
  const normalizedRole = normalizeClientTeamInviteRole(role)
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
    role: normalizedRole,
    status: CLIENT_INVITATION_STATUSES.PENDING,
    token: createToken(idGenerator),
    updated_at: timestamp,
  }

  repositories.workspaceInvitations.upsert(invitation)
  recordInvitationActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CREATED,
    invitation,
    now,
    repositories,
    viewer,
  })

  return invitation
}

export function getClientInvitationByToken({ now = () => new Date().toISOString(), repositories, token }) {
  const normalizedToken = requireText(token, 'Invitation token')
  const invitation = repositories.workspaceInvitations
    .list()
    .find((item) => item.token === normalizedToken)

  if (invitation) {
    const client = repositories.workspaces.findById(invitation.client_id)

    if (!client) {
      throw new Error('Invitation client was not found.')
    }

    const profile = repositories.profiles
      .list()
      .find((item) => item.email.toLowerCase() === invitation.email.toLowerCase()) ?? null

    return { accessToken: null, client, invitation, profile, tokenSource: 'invitation' }
  }

  const accessToken = repositories.invitationAccessTokens
    ?.list()
    .find((item) => item.token === normalizedToken)

  if (!accessToken) {
    throw new Error('Invitation was not found.')
  }

  if (
    accessToken.status === INVITATION_ACCESS_TOKEN_STATUSES.USED
    || accessToken.used_at
  ) {
    throw new Error('Invitation access link was already used.')
  }

  if (accessToken.status === INVITATION_ACCESS_TOKEN_STATUSES.EXPIRED) {
    throw new Error('Invitation access link has expired.')
  }

  if (
    accessToken.expires_at
    && isPastDate(accessToken.expires_at, now)
  ) {
    repositories.invitationAccessTokens.upsert({
      ...accessToken,
      status: INVITATION_ACCESS_TOKEN_STATUSES.EXPIRED,
      updated_at: now(),
    })
    throw new Error('Invitation access link has expired.')
  }

  const invitationByAccessToken = repositories.workspaceInvitations.findById(accessToken.invitation_id)

  if (!invitationByAccessToken) {
    throw new Error('Invitation was not found.')
  }

  const client = repositories.workspaces.findById(invitationByAccessToken.client_id)

  if (!client) {
    throw new Error('Invitation client was not found.')
  }

  const profile = repositories.profiles
    .list()
    .find((item) => item.email.toLowerCase() === invitationByAccessToken.email.toLowerCase()) ?? null

  return {
    accessToken,
    client,
    invitation: invitationByAccessToken,
    profile,
    tokenSource: 'access-token',
  }
}

export function requestClientInvitationAccessLink({
  email,
  idGenerator,
  now = () => new Date().toISOString(),
  repositories,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  let normalizedEmail = ''

  try {
    normalizedEmail = normalizeEmail(email)
  } catch {
    return {
      message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
      sent: false,
    }
  }

  const invitation = repositories.workspaceInvitations
    .list()
    .find((item) => (
      item.email.toLowerCase() === normalizedEmail
      && getInvitationStatus(item, now) === CLIENT_INVITATION_STATUSES.PENDING
    ))

  if (!invitation) {
    return {
      message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
      sent: false,
    }
  }

  const timestamp = now()
  const accessToken = {
    client_id: invitation.client_id,
    created_at: timestamp,
    expires_at: createExpiresAt(now, INVITATION_ACCESS_TOKEN_TTL_MS),
    id: idGenerator(),
    invitation_id: invitation.id,
    status: INVITATION_ACCESS_TOKEN_STATUSES.PENDING,
    token: createToken(idGenerator),
    updated_at: timestamp,
    used_at: null,
  }

  repositories.invitationAccessTokens.upsert(accessToken)

  return {
    accessToken,
    message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
    sent: true,
  }
}

export function cancelClientInvitation({
  activityIdGenerator,
  invitationId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const invitation = repositories.workspaceInvitations.findById(invitationId)

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

  repositories.workspaceInvitations.upsert(nextInvitation)
  recordInvitationActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CANCELLED,
    invitation: nextInvitation,
    now,
    repositories,
    viewer,
  })

  return mapInvitation(nextInvitation, now)
}

export function cancelClientTeamInvitation({
  activityIdGenerator,
  invitationId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const invitation = repositories.workspaceInvitations.findById(invitationId)

  if (!invitation) {
    throw new Error('Invitation was not found.')
  }

  assertCanManageClientTeam({
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

  repositories.workspaceInvitations.upsert(nextInvitation)
  recordInvitationActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CANCELLED,
    invitation: nextInvitation,
    now,
    repositories,
    viewer,
  })

  return mapInvitation(nextInvitation, now)
}

export function acceptClientInvitation({
  activityIdGenerator,
  confirmPassword,
  email,
  idGenerator,
  name,
  now = () => new Date().toISOString(),
  password,
  repositories,
  token,
  viewer = null,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const { accessToken, client, invitation } = getClientInvitationByToken({ now, repositories, token })

  try {
    assertInvitationIsPending(invitation, now)
  } catch (caughtError) {
    if (getInvitationStatus(invitation, now) === CLIENT_INVITATION_STATUSES.EXPIRED) {
      repositories.workspaceInvitations.upsert({
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
    created_at: timestamp,
    email: normalizedEmail,
    id: idGenerator(),
    name: normalizedName,
    updated_at: timestamp,
    user_id: idGenerator(),
  }

  if (existingProfile) {
    if (!viewer?.userId) {
      throw new Error('Sign in to accept this invitation.')
    }

    if (viewer.userId !== existingProfile.user_id) {
      throw new Error('This invitation belongs to another account. Sign in with the invited email to continue.')
    }
  } else {
    const normalizedPassword = validatePasswordPair({ confirmPassword, password })
    createPasswordCredential({
      idGenerator,
      now,
      password: normalizedPassword,
      repositories,
      userId: profile.user_id,
    })
  }

  repositories.profiles.upsert({
    ...profile,
    agency_id: client.agency_id,
    name: normalizedName,
    updated_at: timestamp,
  })

  const existingMembership = repositories.workspaceMemberships
    .list()
    .find((membership) => membership.workspace_id === client.id && membership.user_id === profile.user_id)

  if (!existingMembership) {
    repositories.workspaceMemberships.upsert({
      created_at: timestamp,
      id: idGenerator(),
      role: invitation.role || WORKSPACE_ROLES.VIEWER,
      updated_at: timestamp,
      user_id: profile.user_id,
      workspace_id: client.id,
    })
  }

  const acceptedInvitation = {
    ...invitation,
    accepted_at: timestamp,
    status: CLIENT_INVITATION_STATUSES.ACCEPTED,
    updated_at: timestamp,
  }

  repositories.workspaceInvitations.upsert(acceptedInvitation)
  if (accessToken) {
    repositories.invitationAccessTokens.upsert({
      ...accessToken,
      status: INVITATION_ACCESS_TOKEN_STATUSES.USED,
      updated_at: timestamp,
      used_at: timestamp,
    })
  }
  recordInvitationActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_ACCEPTED,
    invitation: acceptedInvitation,
    now,
    repositories,
    viewer: createInvitationAcceptedActivityViewer({
      client,
      invitation,
      profile,
    }),
  })

  return {
    client,
    profile: repositories.profiles.findByUserId(profile.user_id),
  }
}
