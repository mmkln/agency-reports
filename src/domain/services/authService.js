import {
  CLINIC_REPORTING_CAPABILITIES,
  isActiveProfile,
} from '../../entities/profile'
import { AGENCY_ROLES, AGENCY_ROLE_META } from '../../entities/agency-membership'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'
import { findPasswordCredential, verifyPasswordCredential } from './authCredentialService'
import {
  buildViewerAccessContext,
  hasWorkspaceCapability,
} from './viewerAccessContextService'

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

function assertPassword({ password, profile, repositories }) {
  if (findPasswordCredential({ repositories, userId: profile.user_id })) {
    if (!verifyPasswordCredential({ password, repositories, userId: profile.user_id })) {
      throw new Error('Invalid password.')
    }

    return
  }

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

export function buildViewerFromProfile({ profile, repositories }) {
  return buildViewerAccessContext({ profile, repositories })
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

  if (!isActiveProfile(profile)) {
    clearAuthSession(storage)
    return null
  }

  return buildViewerFromProfile({ profile, repositories })
}

export function listLoginProfiles({ repositories }) {
  return repositories.profiles
    .list()
    .filter(isActiveProfile)
    .map((profile) => {
      const viewer = buildViewerFromProfile({ profile, repositories })
      const agencyMembership = viewer?.agencyMemberships?.[0]
      const workspaceMembership = viewer?.workspaceMemberships?.[0]
      const roleLabel = agencyMembership
        ? AGENCY_ROLE_META[agencyMembership.role]?.label
        : WORKSPACE_ROLE_META[workspaceMembership?.role]?.label

      return {
        ...profile,
        roleLabel: roleLabel ?? 'No active membership',
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
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

  if (!isActiveProfile(profile)) {
    throw new Error('This account is inactive.')
  }

  assertPassword({ password, profile, repositories })
  setAuthSession(profile.user_id, storage, { now })

  return buildViewerFromProfile({ profile, repositories })
}

export function getHomeHrefForViewer(viewer) {
  if (!viewer) {
    return '/login'
  }

  const agencyRole = viewer.agencyMemberships?.[0]?.role ?? null

  if ([AGENCY_ROLES.OWNER, AGENCY_ROLES.ADMIN, AGENCY_ROLES.MANAGER].includes(agencyRole)) {
    return '/admin/clients'
  }

  if (agencyRole) {
    return '/account/settings'
  }

  const activeWorkspaceMembership = (viewer.workspaceMemberships ?? [])
    .find((membership) => membership.workspaceId === viewer.activeWorkspaceId)

  if (
    activeWorkspaceMembership
    && hasWorkspaceCapability(
      viewer,
      CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
      viewer.activeWorkspaceId,
    )
  ) {
    return `/client/growth-review${viewer.activeWorkspaceId ? `?clientId=${viewer.activeWorkspaceId}` : ''}`
  }

  return `/client/settings${viewer.activeWorkspaceId ? `?clientId=${viewer.activeWorkspaceId}` : ''}`
}
