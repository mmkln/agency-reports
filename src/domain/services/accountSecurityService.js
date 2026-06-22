import { isActiveProfile } from '../../entities/profile'
import {
  createPasswordCredential,
  findPasswordCredential,
  validatePasswordPair,
  verifyPasswordCredential,
} from './authCredentialService'

function requireAuthenticatedViewer(viewer) {
  if (!viewer?.userId) {
    throw new Error('You must be signed in to manage account security.')
  }
}

function getOwnProfile({ repositories, viewer }) {
  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile || !isActiveProfile(profile)) {
    throw new Error('Profile was not found.')
  }

  return profile
}

function verifyCurrentPassword({ currentPassword, repositories, userId }) {
  const existingCredential = findPasswordCredential({ repositories, userId })

  if (!existingCredential) {
    throw new Error('Password changes are handled by the backend auth API for this account.')
  }

  return verifyPasswordCredential({
    password: currentPassword,
    repositories,
    userId,
  })
}

export function changeOwnPassword({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = getOwnProfile({ repositories, viewer })

  if (!verifyCurrentPassword({
    currentPassword: input.currentPassword,
    repositories,
    userId: profile.user_id,
  })) {
    throw new Error('Current password is incorrect.')
  }

  const newPassword = validatePasswordPair({
    confirmPassword: input.confirmPassword,
    password: input.newPassword,
  })

  if (verifyCurrentPassword({
    currentPassword: newPassword,
    repositories,
    userId: profile.user_id,
  })) {
    throw new Error('New password must be different from the current password.')
  }

  const credential = createPasswordCredential({
    idGenerator,
    now,
    password: newPassword,
    repositories,
    userId: profile.user_id,
  })

  return {
    updatedAt: credential.updated_at,
    userId: profile.user_id,
  }
}
