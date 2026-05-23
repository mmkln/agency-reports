export const PROFILE_STATUSES = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const CLINIC_REPORTING_CAPABILITIES = Object.freeze({
  DAILY_OPS_MANAGE: 'clinic_layer_daily_ops_manage',
  DAILY_OPS_VIEW: 'clinic_layer_daily_ops_view',
  DENTAL_GROWTH_REVIEW_MANAGE: 'dental_growth_review_manage',
  DENTAL_GROWTH_REVIEW_VIEW: 'dental_growth_review_view',
  EXECUTIVE_VIEW: 'clinic_layer_executive_view',
  MONTHLY_FINANCE_VIEW: 'clinic_layer_monthly_finance_view',
  OPERATIONAL_ROWS_VIEW: 'clinic_operational_rows_view',
  REPORTING_IMPORT: 'clinic_reporting_import',
  REPORTING_PUBLISH: 'clinic_reporting_publish',
  WEEKLY_OPERATOR_VIEW: 'clinic_layer_weekly_operator_view',
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
