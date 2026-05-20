import { USER_ROLES } from '../../entities/profile'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLES.AGENCY_ADMIN]: 'Agency admin',
  [USER_ROLES.AGENCY_TEAM]: 'Agency team',
  [USER_ROLES.CLIENT_ADMIN]: 'Client admin',
  [USER_ROLES.CLIENT_TEAM]: 'Client team',
})

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeEmail(value = '') {
  return normalizeText(value).toLowerCase()
}

function requireAuthenticatedViewer(viewer) {
  if (!viewer?.userId) {
    throw new Error('You must be signed in to manage account settings.')
  }
}

export function mapAccountProfile({ profile, viewer }) {
  const role = profile?.role ?? viewer?.role

  return {
    email: profile?.email ?? viewer?.email ?? '',
    name: profile?.name ?? viewer?.name ?? '',
    role,
    roleLabel: USER_ROLE_LABELS[role] ?? role,
    userId: viewer?.userId ?? profile?.user_id ?? null,
  }
}

export function getOwnProfileSettings({
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile) {
    throw new Error('Profile was not found.')
  }

  return mapAccountProfile({ profile, viewer })
}

export function updateOwnProfileSettings({
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile) {
    throw new Error('Profile was not found.')
  }

  const name = normalizeText(input?.name)
  const email = normalizeEmail(input?.email)

  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters.')
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Email must be a valid email address.')
  }

  const duplicateProfile = repositories.profiles
    .list()
    .find((candidate) => (
      candidate.user_id !== viewer.userId
      && String(candidate.email ?? '').toLowerCase() === email
    ))

  if (duplicateProfile) {
    throw new Error('Email is already used by another account.')
  }

  const updatedProfile = repositories.profiles.upsert({
    ...profile,
    email,
    name,
    updated_at: now(),
  })

  return mapAccountProfile({ profile: updatedProfile, viewer })
}
