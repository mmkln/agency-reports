export const PROFILE_STATUSES = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const CLINIC_REPORTING_CAPABILITIES = Object.freeze({
  DENTAL_GROWTH_REVIEW_VIEW: 'dental_growth_review_view',
})

export function isActiveProfile(profile) {
  return profile?.status !== PROFILE_STATUSES.INACTIVE
}

export function getViewerCapabilities(viewerOrProfile) {
  return [...new Set(Array.isArray(viewerOrProfile?.capabilities)
    ? viewerOrProfile.capabilities
    : [])]
}

export function hasCapability(viewer, capability) {
  if (!capability) {
    return true
  }

  return getViewerCapabilities(viewer).includes(capability)
}

export function hasEveryCapability(viewer, capabilities = []) {
  return capabilities.every((capability) => hasCapability(viewer, capability))
}
