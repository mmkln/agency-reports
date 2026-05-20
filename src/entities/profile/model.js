export const USER_ROLES = Object.freeze({
  AGENCY_ADMIN: 'agency_admin',
  AGENCY_TEAM: 'agency_team',
  CLIENT_ADMIN: 'client_admin',
  CLIENT_TEAM: 'client_team',
  CLIENT_USER: 'client_admin',
})

export const LEGACY_USER_ROLES = Object.freeze({
  CLIENT_USER: 'client_user',
})

export const CLIENT_PORTAL_ROLES = Object.freeze([
  USER_ROLES.CLIENT_ADMIN,
  USER_ROLES.CLIENT_TEAM,
])

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

const ROLE_DEFAULT_CAPABILITIES = Object.freeze({
  [USER_ROLES.AGENCY_ADMIN]: Object.values(CLINIC_REPORTING_CAPABILITIES),
  [USER_ROLES.AGENCY_TEAM]: [
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW,
    CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW,
    CLINIC_REPORTING_CAPABILITIES.OPERATIONAL_ROWS_VIEW,
  ],
  [USER_ROLES.CLIENT_ADMIN]: [
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
  ],
  [USER_ROLES.CLIENT_TEAM]: [],
})

export function normalizeUserRole(role) {
  if (role === LEGACY_USER_ROLES.CLIENT_USER) {
    return USER_ROLES.CLIENT_ADMIN
  }

  return Object.values(USER_ROLES).includes(role) ? role : role
}

export function isClientPortalRole(role) {
  return CLIENT_PORTAL_ROLES.includes(normalizeUserRole(role))
}

export function getDefaultCapabilitiesForRole(role) {
  return ROLE_DEFAULT_CAPABILITIES[normalizeUserRole(role)] ?? []
}

export function getViewerCapabilities(viewerOrProfile) {
  const explicitCapabilities = Array.isArray(viewerOrProfile?.capabilities)
    ? viewerOrProfile.capabilities
    : []

  return [...new Set([
    ...getDefaultCapabilitiesForRole(viewerOrProfile?.role),
    ...explicitCapabilities,
  ])]
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
