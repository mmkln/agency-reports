import { USER_ROLES } from '../../entities/profile'

export const AUTH_SESSION_STORAGE_KEY = 'agency-reports.auth-session'
export const DEMO_AUTH_PASSWORD = 'password'
export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8

function getDefaultStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null
}

function safeReadSession(storage = getDefaultStorage()) {
  try {
    if (!storage) {
      return null
    }

    const rawSession = storage.getItem(AUTH_SESSION_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function isSessionExpired(session, now = () => new Date().toISOString()) {
  if (!session?.expiresAt) {
    return false
  }

  const expiresAt = new Date(session.expiresAt).getTime()
  const currentTime = new Date(now()).getTime()

  if (Number.isNaN(expiresAt) || Number.isNaN(currentTime)) {
    return true
  }

  return expiresAt <= currentTime
}

function createExpiresAt(now, ttlMs) {
  return new Date(new Date(now()).getTime() + ttlMs).toISOString()
}

function assertPassword(password) {
  if (password !== DEMO_AUTH_PASSWORD) {
    throw new Error('Invalid password.')
  }
}

export function setAuthSession(
  userId,
  storage = getDefaultStorage(),
  {
    now = () => new Date().toISOString(),
    ttlMs = DEFAULT_SESSION_TTL_MS,
  } = {},
) {
  if (!storage) {
    return
  }

  storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({
    expiresAt: createExpiresAt(now, ttlMs),
    userId,
  }))
}

export function clearAuthSession(storage = getDefaultStorage()) {
  if (!storage) {
    return
  }

  storage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

function getClientIdsForProfile(profile, repositories) {
  const membershipClientIds = repositories.clientMemberships
    .list()
    .filter((membership) => membership.user_id === profile.user_id)
    .map((membership) => membership.client_id)

  if (profile.role === USER_ROLES.CLIENT_USER) {
    return [...new Set(membershipClientIds)]
  }

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
    clientId: profile.role === USER_ROLES.CLIENT_USER ? clientIds[0] ?? null : profile.client_id ?? null,
    clientIds,
    email: profile.email,
    name: profile.name,
    profileId: profile.id,
    role: profile.role,
    userId: profile.user_id,
  }
}

export function getCurrentViewer({
  now = () => new Date().toISOString(),
  repositories,
  storage = getDefaultStorage(),
}) {
  const session = safeReadSession(storage)

  if (!session?.userId) {
    return null
  }

  if (isSessionExpired(session, now)) {
    clearAuthSession(storage)
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
  now = () => new Date().toISOString(),
  password,
  repositories,
  storage = getDefaultStorage(),
}) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const profile = repositories.profiles
    .list()
    .find((item) => item.email.toLowerCase() === normalizedEmail)

  if (!profile) {
    throw new Error('No portal user exists for this email.')
  }

  assertPassword(password)
  setAuthSession(profile.user_id, storage, { now })

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
