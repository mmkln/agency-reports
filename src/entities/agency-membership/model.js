import { CLINIC_REPORTING_CAPABILITIES } from '../profile'

export const AGENCY_MEMBERSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  REMOVED: 'removed',
})

export const AGENCY_ROLES = Object.freeze({
  OWNER: 'agency_owner',
  ADMIN: 'agency_admin',
  MANAGER: 'agency_manager',
  TEAM: 'agency_team',
  CONTRACTOR: 'agency_contractor',
  VIEWER: 'agency_viewer',
})

export const AGENCY_CAPABILITIES = Object.freeze({
  MANAGE_SETTINGS: 'agency.manage_settings',
  MANAGE_MEMBERS: 'agency.manage_members',
  CREATE_WORKSPACE: 'workspace.create',
  MANAGE_WORKSPACE_RELATIONSHIPS: 'workspace.manage_relationships',
  MANAGE_WORKSPACE_ACCESS: 'workspace.manage_access',
  PUBLISH_REPORTS: 'reports.publish',
  MANAGE_DASHBOARDS: 'dashboards.manage',
  MANAGE_TASKS: 'tasks.manage',
  TRIAGE_REQUESTS: 'requests.triage',
  MANAGE_COMPLIANCE: 'compliance.manage',
  PUBLISH_FILES: 'files.publish',
  VIEW_INTERNAL_ACTIVITY: 'activity.view_internal',
})

export const AGENCY_ROLE_META = Object.freeze({
  [AGENCY_ROLES.OWNER]: {
    label: 'Agency Owner',
    tone: 'blue',
  },
  [AGENCY_ROLES.ADMIN]: {
    label: 'Agency Admin',
    tone: 'blue',
  },
  [AGENCY_ROLES.MANAGER]: {
    label: 'Agency Manager',
    tone: 'purple',
  },
  [AGENCY_ROLES.TEAM]: {
    label: 'Agency Team',
    tone: 'neutral',
  },
  [AGENCY_ROLES.CONTRACTOR]: {
    label: 'Agency Contractor',
    tone: 'neutral',
  },
  [AGENCY_ROLES.VIEWER]: {
    label: 'Agency Viewer',
    tone: 'neutral',
  },
})

const ALL_AGENCY_CAPABILITIES = Object.freeze([
  ...Object.values(AGENCY_CAPABILITIES),
  ...Object.values(CLINIC_REPORTING_CAPABILITIES),
])

const AGENCY_ROLE_DEFAULT_CAPABILITIES = Object.freeze({
  [AGENCY_ROLES.OWNER]: ALL_AGENCY_CAPABILITIES,
  [AGENCY_ROLES.ADMIN]: ALL_AGENCY_CAPABILITIES,
  [AGENCY_ROLES.MANAGER]: [
    AGENCY_CAPABILITIES.CREATE_WORKSPACE,
    AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS,
    AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS,
    AGENCY_CAPABILITIES.PUBLISH_REPORTS,
    AGENCY_CAPABILITIES.MANAGE_DASHBOARDS,
    AGENCY_CAPABILITIES.MANAGE_TASKS,
    AGENCY_CAPABILITIES.TRIAGE_REQUESTS,
    AGENCY_CAPABILITIES.MANAGE_COMPLIANCE,
    AGENCY_CAPABILITIES.PUBLISH_FILES,
    AGENCY_CAPABILITIES.VIEW_INTERNAL_ACTIVITY,
    ...Object.values(CLINIC_REPORTING_CAPABILITIES),
  ],
  [AGENCY_ROLES.TEAM]: [
    AGENCY_CAPABILITIES.MANAGE_TASKS,
    AGENCY_CAPABILITIES.TRIAGE_REQUESTS,
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
    CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW,
    CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW,
    CLINIC_REPORTING_CAPABILITIES.OPERATIONAL_ROWS_VIEW,
  ],
  [AGENCY_ROLES.CONTRACTOR]: [
    AGENCY_CAPABILITIES.MANAGE_TASKS,
  ],
  [AGENCY_ROLES.VIEWER]: [
    AGENCY_CAPABILITIES.VIEW_INTERNAL_ACTIVITY,
  ],
})

export function isActiveAgencyMembership(membership) {
  return membership?.status !== AGENCY_MEMBERSHIP_STATUSES.REMOVED
}

export function getAgencyRoleDefaultCapabilities(role) {
  return AGENCY_ROLE_DEFAULT_CAPABILITIES[role] ?? []
}

export function getAgencyMembershipCapabilities(membership) {
  return [...new Set([
    ...getAgencyRoleDefaultCapabilities(membership?.role),
    ...(Array.isArray(membership?.capabilities) ? membership.capabilities : []),
  ])]
}

