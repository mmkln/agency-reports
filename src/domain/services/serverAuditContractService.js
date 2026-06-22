import { ACTIVITY_EVENT_TYPES } from './activityTrackingService'

export const SERVER_AUDIT_TRANSITION_GROUPS = Object.freeze({
  CLIENT_ACCESS: 'client_access',
  CLIENT_ACTION: 'client_action',
  CLIENT_WORK_PUBLISHING: 'client_work_publishing',
  CLINIC_COMPLIANCE: 'clinic_compliance',
})

export const SERVER_AUDIT_SEVERITIES = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
})

const SERVER_AUDIT_TRANSITIONS = Object.freeze([
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_WORK_PUBLISHING,
    requiredMetadata: ['workItemId', 'publishState', 'title'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'client_work_items',
    transition: 'publish_client_work_item',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_ARCHIVED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_WORK_PUBLISHING,
    requiredMetadata: ['workItemId', 'publishState', 'title'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'client_work_items',
    transition: 'archive_client_work_item',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CREATED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACCESS,
    requiredMetadata: ['invitationId', 'email', 'role', 'status'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'workspace_invitations',
    transition: 'create_client_invitation',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CANCELLED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACCESS,
    requiredMetadata: ['invitationId', 'email', 'role', 'status'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'workspace_invitations',
    transition: 'cancel_client_invitation',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_ACCEPTED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACCESS,
    requiredMetadata: ['invitationId', 'email', 'role', 'status'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'workspace_invitations',
    transition: 'accept_client_invitation',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACTION,
    requiredMetadata: ['actionId', 'status', 'title', 'type'],
    severity: SERVER_AUDIT_SEVERITIES.MEDIUM,
    sourceTable: 'needed_from_client',
    transition: 'client_answer_needed_action',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_RESOLVED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACTION,
    requiredMetadata: ['actionId', 'status', 'title', 'type'],
    severity: SERVER_AUDIT_SEVERITIES.MEDIUM,
    sourceTable: 'needed_from_client',
    transition: 'resolve_needed_action',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_CANCELLED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACTION,
    requiredMetadata: ['actionId', 'status', 'title', 'type'],
    severity: SERVER_AUDIT_SEVERITIES.MEDIUM,
    sourceTable: 'needed_from_client',
    transition: 'cancel_needed_action',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLINIC_COMPLIANCE_RECORD_PUBLISHED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLINIC_COMPLIANCE,
    requiredMetadata: ['recordId', 'recordType', 'status', 'title'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'compliance_reviews',
    transition: 'publish_clinic_compliance_record',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLINIC_COMPLIANCE_STATUS_CHANGED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLINIC_COMPLIANCE,
    requiredMetadata: ['fromStatus', 'recordId', 'recordType', 'status', 'title'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'compliance_reviews',
    transition: 'change_clinic_compliance_status',
  },
  {
    eventType: ACTIVITY_EVENT_TYPES.CLINIC_MEDICAL_APPROVAL_DECIDED,
    group: SERVER_AUDIT_TRANSITION_GROUPS.CLINIC_COMPLIANCE,
    requiredMetadata: ['approvalType', 'fromStatus', 'recordId', 'recordType', 'status', 'title'],
    severity: SERVER_AUDIT_SEVERITIES.HIGH,
    sourceTable: 'medical_approvals',
    transition: 'decide_clinic_medical_approval',
  },
])

export function createServerAuditTransitionManifest() {
  return SERVER_AUDIT_TRANSITIONS.map((transition) => ({ ...transition }))
}

export function getServerAuditTransition(transitionName) {
  return createServerAuditTransitionManifest()
    .find((transition) => transition.transition === transitionName) ?? null
}

export function getServerAuditTransitionsBySourceTable(sourceTable) {
  return createServerAuditTransitionManifest()
    .filter((transition) => transition.sourceTable === sourceTable)
}
