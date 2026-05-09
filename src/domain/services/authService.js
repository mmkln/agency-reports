import { USER_ROLES } from '../../entities/profile'

export const AUTH_SESSION_STORAGE_KEY = 'agency-reports.auth-session'

function safeReadSession(storage = window.localStorage) {
  try {
    const rawSession = storage.getItem(AUTH_SESSION_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

export function setAuthSession(userId, storage = window.localStorage) {
  storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({ userId }))
}

export function clearAuthSession(storage = window.localStorage) {
  storage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

function getClientIdsForProfile(profile, repositories) {
  const membershipClientIds = repositories.clientMemberships
    .list()
    .filter((membership) => membership.user_id === profile.user_id)
    .map((membership) => membership.client_id)

  return [...new Set([
    ...(profile.client_id ? [profile.client_id] : []),
    ...(profile.client_ids ?? []),
    ...membershipClientIds,
  ])]
}

export function buildViewerFromProfile({ profile, repositories }) {
  if (!profile) {
    return null
  }

  const clientIds = getClientIdsForProfile(profile, repositories)

  return {
    agencyId: profile.agency_id,
    clientId: profile.role === USER_ROLES.CLIENT_USER ? clientIds[0] ?? profile.client_id ?? null : profile.client_id ?? null,
    clientIds,
    email: profile.email,
    name: profile.name,
    profileId: profile.id,
    role: profile.role,
    userId: profile.user_id,
  }
}

export function getCurrentViewer({ repositories, storage = window.localStorage }) {
  const session = safeReadSession(storage)

  if (!session?.userId) {
    return null
  }

  const profile = repositories.profiles.findByUserId(session.userId)

  return buildViewerFromProfile({ profile, repositories })
}

export function listLoginProfiles({ repositories }) {
  return repositories.profiles
    .list()
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))
}

export function authenticateWithEmail({
  email,
  repositories,
  storage = window.localStorage,
}) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const profile = repositories.profiles
    .list()
    .find((item) => item.email.toLowerCase() === normalizedEmail)

  if (!profile) {
    throw new Error('No portal user exists for this email.')
  }

  setAuthSession(profile.user_id, storage)

  return buildViewerFromProfile({ profile, repositories })
}

export function getHomeHrefForViewer(viewer) {
  if (!viewer) {
    return '#login'
  }

  if (viewer.role === USER_ROLES.AGENCY_ADMIN) {
    return '#admin-clients'
  }

  if (viewer.role === USER_ROLES.AGENCY_TEAM) {
    return '#team-tasks'
  }

  return `#client-overview${viewer.clientId ? `?clientId=${viewer.clientId}` : ''}`
}
