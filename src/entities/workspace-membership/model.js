import { CLINIC_REPORTING_CAPABILITIES } from '../profile'

export const WORKSPACE_MEMBERSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  REMOVED: 'removed',
})

export const WORKSPACE_ROLES = Object.freeze({
  OWNER: 'workspace_owner',
  ADMIN: 'workspace_admin',
  MEMBER: 'workspace_member',
  VIEWER: 'workspace_viewer',
  CLINIC_OWNER: 'clinic_owner',
  FRONT_DESK: 'front_desk',
  MARKETING_CONTACT: 'marketing_contact',
  FINANCE_CONTACT: 'finance_contact',
})

export const WORKSPACE_CAPABILITIES = Object.freeze({
  VIEW_PORTAL: 'workspace.view_portal',
  MANAGE_SETTINGS: 'workspace.manage_settings',
  MANAGE_MEMBERS: 'workspace.manage_members',
  REQUEST_DELETION: 'workspace.request_deletion',
  RESPOND_TO_ACTIONS: 'actions.respond',
  REVIEW_APPROVALS: 'approvals.review',
  MEDICAL_APPROVE: 'approvals.medical_approve',
  CREATE_REQUESTS: 'requests.create',
  UPLOAD_FILES: 'files.upload',
  VIEW_FILES: 'files.view',
  VIEW_REPORTS: 'reports.view',
  VIEW_DASHBOARDS: 'dashboards.view',
  VIEW_INTEGRATIONS: 'integrations.view',
  MANAGE_INTEGRATIONS: 'integrations.manage',
  VIEW_CLINIC_METRICS: 'clinic_metrics.view',
  RESPOND_TO_REPUTATION: 'reputation.respond',
  REVIEW_COMPLIANCE: 'compliance.review',
})

export const WORKSPACE_ROLE_META = Object.freeze({
  [WORKSPACE_ROLES.OWNER]: { label: 'Owner', tone: 'blue' },
  [WORKSPACE_ROLES.ADMIN]: { label: 'Admin', tone: 'blue' },
  [WORKSPACE_ROLES.MEMBER]: { label: 'Member', tone: 'neutral' },
  [WORKSPACE_ROLES.VIEWER]: { label: 'Viewer', tone: 'neutral' },
  [WORKSPACE_ROLES.CLINIC_OWNER]: { label: 'Clinic Owner', tone: 'blue' },
  [WORKSPACE_ROLES.FRONT_DESK]: { label: 'Front Desk', tone: 'green' },
  [WORKSPACE_ROLES.MARKETING_CONTACT]: { label: 'Marketing Contact', tone: 'neutral' },
  [WORKSPACE_ROLES.FINANCE_CONTACT]: { label: 'Finance Contact', tone: 'amber' },
})

const ALL_WORKSPACE_CAPABILITIES = Object.freeze([
  ...Object.values(WORKSPACE_CAPABILITIES),
  ...Object.values(CLINIC_REPORTING_CAPABILITIES),
])

const WORKSPACE_ROLE_DEFAULT_CAPABILITIES = Object.freeze({
  [WORKSPACE_ROLES.OWNER]: ALL_WORKSPACE_CAPABILITIES,
  [WORKSPACE_ROLES.ADMIN]: ALL_WORKSPACE_CAPABILITIES,
  [WORKSPACE_ROLES.MEMBER]: [
    WORKSPACE_CAPABILITIES.VIEW_PORTAL,
    WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS,
    WORKSPACE_CAPABILITIES.CREATE_REQUESTS,
    WORKSPACE_CAPABILITIES.VIEW_FILES,
    WORKSPACE_CAPABILITIES.VIEW_REPORTS,
    WORKSPACE_CAPABILITIES.VIEW_DASHBOARDS,
  ],
  [WORKSPACE_ROLES.VIEWER]: [
    WORKSPACE_CAPABILITIES.VIEW_PORTAL,
    WORKSPACE_CAPABILITIES.VIEW_FILES,
    WORKSPACE_CAPABILITIES.VIEW_REPORTS,
    WORKSPACE_CAPABILITIES.VIEW_DASHBOARDS,
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
  ],
  [WORKSPACE_ROLES.CLINIC_OWNER]: ALL_WORKSPACE_CAPABILITIES,
  [WORKSPACE_ROLES.FRONT_DESK]: [
    WORKSPACE_CAPABILITIES.VIEW_PORTAL,
    WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS,
    WORKSPACE_CAPABILITIES.CREATE_REQUESTS,
    WORKSPACE_CAPABILITIES.VIEW_CLINIC_METRICS,
  ],
  [WORKSPACE_ROLES.MARKETING_CONTACT]: [
    WORKSPACE_CAPABILITIES.VIEW_PORTAL,
    WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS,
    WORKSPACE_CAPABILITIES.CREATE_REQUESTS,
    WORKSPACE_CAPABILITIES.VIEW_FILES,
    WORKSPACE_CAPABILITIES.VIEW_REPORTS,
    WORKSPACE_CAPABILITIES.VIEW_DASHBOARDS,
    WORKSPACE_CAPABILITIES.VIEW_CLINIC_METRICS,
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
  ],
  [WORKSPACE_ROLES.FINANCE_CONTACT]: [
    WORKSPACE_CAPABILITIES.VIEW_PORTAL,
    WORKSPACE_CAPABILITIES.VIEW_REPORTS,
    WORKSPACE_CAPABILITIES.VIEW_DASHBOARDS,
  ],
})

export function isActiveWorkspaceMembership(membership) {
  return membership?.status !== WORKSPACE_MEMBERSHIP_STATUSES.REMOVED
}

export function getWorkspaceRoleDefaultCapabilities(role) {
  return WORKSPACE_ROLE_DEFAULT_CAPABILITIES[role] ?? []
}

export function getWorkspaceMembershipCapabilities(membership) {
  return [...new Set([
    ...getWorkspaceRoleDefaultCapabilities(membership?.role),
    ...(Array.isArray(membership?.capabilities) ? membership.capabilities : []),
  ])]
}
