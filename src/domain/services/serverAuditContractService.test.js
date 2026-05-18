import { describe, expect, it } from 'vitest'

import { ACTIVITY_EVENT_TYPES } from './activityTrackingService'
import {
  createServerAuditTransitionManifest,
  getServerAuditTransition,
  getServerAuditTransitionsBySourceTable,
  SERVER_AUDIT_SEVERITIES,
  SERVER_AUDIT_TRANSITION_GROUPS,
} from './serverAuditContractService'

describe('serverAuditContractService', () => {
  it('defines server audit obligations for critical publish, access, response, and compliance transitions', () => {
    const manifest = createServerAuditTransitionManifest()

    expect(manifest).toEqual(expect.arrayContaining([
      expect.objectContaining({
        eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
        group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_WORK_PUBLISHING,
        severity: SERVER_AUDIT_SEVERITIES.HIGH,
        transition: 'publish_client_work_item',
      }),
      expect.objectContaining({
        eventType: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_ACCEPTED,
        group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACCESS,
        severity: SERVER_AUDIT_SEVERITIES.HIGH,
        transition: 'accept_client_invitation',
      }),
      expect.objectContaining({
        eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
        group: SERVER_AUDIT_TRANSITION_GROUPS.CLIENT_ACTION,
        transition: 'client_answer_needed_action',
      }),
      expect.objectContaining({
        eventType: ACTIVITY_EVENT_TYPES.CLINIC_MEDICAL_APPROVAL_DECIDED,
        group: SERVER_AUDIT_TRANSITION_GROUPS.CLINIC_COMPLIANCE,
        severity: SERVER_AUDIT_SEVERITIES.HIGH,
        transition: 'decide_clinic_medical_approval',
      }),
    ]))
  })

  it('keeps all manifest event types aligned with activity event types', () => {
    const validEventTypes = new Set(Object.values(ACTIVITY_EVENT_TYPES))

    for (const transition of createServerAuditTransitionManifest()) {
      expect(validEventTypes.has(transition.eventType), transition.transition).toBe(true)
      expect(transition.requiredMetadata.length, transition.transition).toBeGreaterThan(0)
    }
  })

  it('keeps transition names unique and searchable', () => {
    const manifest = createServerAuditTransitionManifest()
    const transitionNames = manifest.map((transition) => transition.transition)

    expect(new Set(transitionNames).size).toBe(transitionNames.length)
    expect(getServerAuditTransition('publish_client_work_item')).toMatchObject({
      sourceTable: 'client_work_items',
    })
    expect(getServerAuditTransitionsBySourceTable('client_invitations').map((transition) => (
      transition.transition
    ))).toEqual([
      'create_client_invitation',
      'cancel_client_invitation',
      'accept_client_invitation',
    ])
  })
})
