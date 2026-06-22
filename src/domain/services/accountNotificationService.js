import { isActiveProfile } from '../../entities/profile'

export const DEFAULT_NOTIFICATION_PREFERENCES = Object.freeze({
  actionNeeded: true,
  emailUpdates: true,
  weeklySummary: false,
})

function requireAuthenticatedViewer(viewer) {
  if (!viewer?.userId) {
    throw new Error('You must be signed in to manage notification preferences.')
  }
}

function getOwnProfile({ repositories, viewer }) {
  const profile = repositories.profiles.findByUserId(viewer.userId)

  if (!profile || !isActiveProfile(profile)) {
    throw new Error('Profile was not found.')
  }

  return profile
}

function normalizeNotificationPreferences(preferences = {}) {
  return {
    actionNeeded: preferences.actionNeeded ?? preferences.action_needed ?? DEFAULT_NOTIFICATION_PREFERENCES.actionNeeded,
    emailUpdates: preferences.emailUpdates ?? preferences.email_updates ?? DEFAULT_NOTIFICATION_PREFERENCES.emailUpdates,
    weeklySummary: preferences.weeklySummary ?? preferences.weekly_summary ?? DEFAULT_NOTIFICATION_PREFERENCES.weeklySummary,
  }
}

function toRecordPreferences(preferences) {
  const normalizedPreferences = normalizeNotificationPreferences(preferences)

  return {
    action_needed: Boolean(normalizedPreferences.actionNeeded),
    email_updates: Boolean(normalizedPreferences.emailUpdates),
    weekly_summary: Boolean(normalizedPreferences.weeklySummary),
  }
}

export function getOwnNotificationPreferences({
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = getOwnProfile({ repositories, viewer })

  return normalizeNotificationPreferences(profile.notification_preferences)
}

export function updateOwnNotificationPreferences({
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireAuthenticatedViewer(viewer)

  const profile = getOwnProfile({ repositories, viewer })
  const timestamp = now()
  const updatedProfile = repositories.profiles.upsert({
    ...profile,
    notification_preferences: toRecordPreferences(input),
    updated_at: timestamp,
  })

  return normalizeNotificationPreferences(updatedProfile.notification_preferences)
}
