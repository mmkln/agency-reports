import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_POLICY_ISSUE_STATUSES,
  CLINIC_POLICY_ISSUE_TYPES,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import {
  approveMedicalApproval,
  expireMedicalApproval,
  getAdminClinicCompliancePage,
  publishComplianceReview,
  publishMedicalApproval,
  rejectMedicalApproval,
  requestChangesForMedicalApproval,
  saveAdminClinicCompliance,
  transitionComplianceReviewStatus,
} from './adminClinicComplianceService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  LOCATION_A: '55555555-5555-4555-8555-555555555555',
  SERVICE_A: '66666666-6666-4666-8666-666666666666',
  REVIEW_A: '77777777-7777-4777-8777-777777777777',
  APPROVAL_A: '88888888-8888-4888-8888-888888888888',
})

function createRepository(initialRecords = []) {
  const records = [...initialRecords]

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

      return record
    },
    deleteById(id) {
      const index = records.findIndex((record) => record.id === id)

      if (index < 0) {
        return false
      }

      records.splice(index, 1)
      return true
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createRepository([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental',
        primary_contact_email: 'owner@green.test',
        primary_contact_name: 'Owner',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_B,
        name: 'Generic Client',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    clinicLocations: createRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.LOCATION_A,
        is_active: true,
        name: 'Main Clinic',
      },
    ]),
    clinicServiceLines: createRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.SERVICE_A,
        location_ids: [IDS.LOCATION_A],
        name: 'Dental Implants',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      },
    ]),
    complianceReviews: createRepository([]),
    medicalApprovals: createRepository([]),
    neededFromClient: createRepository([]),
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    agencyId,
    email: 'admin@agency.test',
    name: 'Agency Admin',
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user-id',
  }
}

function createApproval(overrides = {}) {
  return {
    approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
    client_id: IDS.CLIENT_A,
    due_date: '2026-05-20',
    id: IDS.APPROVAL_A,
    instructions: 'Review and approve the medical claim wording.',
    status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    title: 'Implant success-rate claim',
    version: 'v1',
    ...overrides,
  }
}

describe('adminClinicComplianceService', () => {
  it('reads compliance reviews and medical approvals with clinic foundation context', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          location_id: IDS.LOCATION_A,
          open_issues: 2,
          platform: 'Google Ads',
          service_line_id: IDS.SERVICE_A,
          status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
          title: 'Implants ads policy review',
        },
      ]),
      medicalApprovals: createRepository([
        {
          approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
          client_id: IDS.CLIENT_A,
          due_date: '2026-05-20',
          id: IDS.APPROVAL_A,
          status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
          title: 'Implant success-rate claim',
          version: 'v1',
        },
      ]),
    })

    const page = getAdminClinicCompliancePage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.client.name).toBe('Green Dental Clinic')
    expect(page.locations).toHaveLength(1)
    expect(page.serviceLines).toHaveLength(1)
    expect(page.complianceReviews[0]).toMatchObject({
      compliance_action_suggestions: [
        {
          hasOpenAction: false,
          type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
        },
      ],
      open_issues: 2,
      status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
    })
    expect(page.medicalApprovals[0]).toMatchObject({
      approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
      medical_approval_action_suggestions: [
        {
          defaultActionType: NEEDED_ACTION_TYPES.APPROVAL,
          hasOpenAction: false,
          type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
        },
      ],
      status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    })
  })

  it('marks existing open compliance and approval actions in suggestions', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          open_issues: 1,
          policy_issues: [
            {
              status: CLINIC_POLICY_ISSUE_STATUSES.OPEN,
              type: CLINIC_POLICY_ISSUE_TYPES.PRIVACY_TRACKING,
            },
          ],
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
          title: 'Tracking policy review',
        },
      ]),
      medicalApprovals: createRepository([
        createApproval({
          approval_type: CLINIC_APPROVAL_TYPES.LANDING_PAGE,
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        }),
      ]),
      neededFromClient: createRepository([
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING,
          id: 'action-open-compliance',
          related_compliance_review_id: IDS.REVIEW_A,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm tracking',
        },
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_LANDING_PAGE,
          id: 'action-resolved-approval',
          related_medical_approval_id: IDS.APPROVAL_A,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Old landing page approval',
        },
      ]),
    })

    const page = getAdminClinicCompliancePage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.complianceReviews[0].compliance_action_suggestions).toEqual([
      {
        actionLabel: 'Create compliance action',
        defaultActionType: NEEDED_ACTION_TYPES.DECISION,
        hasOpenAction: true,
        openAction: {
          id: 'action-open-compliance',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm tracking',
        },
        type: CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING,
      },
    ])
    expect(page.medicalApprovals[0].medical_approval_action_suggestions).toEqual([
      {
        actionLabel: 'Create approval action',
        defaultActionType: NEEDED_ACTION_TYPES.APPROVAL,
        hasOpenAction: false,
        openAction: null,
        type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_LANDING_PAGE,
      },
    ])
  })

  it('saves compliance reviews and medical approvals as aggregate records', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.REVIEW_A, IDS.APPROVAL_A]

    const page = saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        complianceReviews: [
          {
            blocked_items: '1',
            data_source: 'Manual policy review',
            limited_ads: '2',
            location_id: IDS.LOCATION_A,
            next_action: 'Revise the landing page claim before launch.',
            open_issues: '3',
            pending_approvals: '1',
            policy_issues: [
              {
                affected_campaign: 'Implants search',
                next_action: 'Revise claim language and resubmit.',
                platform: 'Google Ads',
                reason: 'Ad limited by healthcare policy.',
                status: CLINIC_POLICY_ISSUE_STATUSES.OPEN,
                type: CLINIC_POLICY_ISSUE_TYPES.LIMITED_AD,
              },
            ],
            platform: 'Google Ads',
            risk_note: 'Avoid guaranteed outcome language.',
            service_line_id: IDS.SERVICE_A,
            status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
            summary: 'Implants ads need claim review.',
            title: 'Implants campaign compliance',
          },
        ],
        medicalApprovals: [
          {
            approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
            approver_label: 'Dr. Patel',
            due_date: '2026-05-20',
            history: [
              {
                actor_label: 'Dr. Patel',
                comment: 'Review requested.',
                decision: 'pending',
                decided_at: '2026-05-17T10:00:00.000Z',
                version: 'v1',
              },
            ],
            instructions: 'Confirm that the claim is medically accurate.',
            location_id: IDS.LOCATION_A,
            requested_by_label: 'Agency team',
            service_line_id: IDS.SERVICE_A,
            status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
            title: 'Implant success-rate claim',
            version: 'v1',
          },
        ],
      },
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.complianceReviews[0]).toMatchObject({
      client_id: IDS.CLIENT_A,
      id: IDS.REVIEW_A,
      last_updated_at: '2026-05-18T10:00:00.000Z',
      limited_ads: 2,
      policy_issues: [
        expect.objectContaining({
          affected_campaign: 'Implants search',
          platform: 'Google Ads',
          status: CLINIC_POLICY_ISSUE_STATUSES.OPEN,
          type: CLINIC_POLICY_ISSUE_TYPES.LIMITED_AD,
        }),
      ],
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      service_line_id: IDS.SERVICE_A,
    })
    expect(page.medicalApprovals[0]).toMatchObject({
      client_id: IDS.CLIENT_A,
      history: [
        expect.objectContaining({
          actor_label: 'Dr. Patel',
          decision: 'pending',
          version: 'v1',
        }),
      ],
      id: IDS.APPROVAL_A,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      title: 'Implant success-rate claim',
    })
  })

  it('publishes compliance reviews and medical approvals with audit metadata', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          platform: 'Google Ads',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          status: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
          title: 'Tracking review',
        },
      ]),
      medicalApprovals: createRepository([
        createApproval({
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        }),
      ]),
    })

    const reviewPage = publishComplianceReview({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      reviewId: IDS.REVIEW_A,
      viewer: createAdminViewer(),
    })
    const approvalPage = publishMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T10:30:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(reviewPage.complianceReviews[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:00:00.000Z',
      published_by: 'admin-user-id',
    })
    expect(approvalPage.medicalApprovals[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:30:00.000Z',
      published_by: 'admin-user-id',
    })
  })

  it('blocks publishing not-reviewed compliance reviews', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
          title: 'Tracking review',
        },
      ]),
    })

    expect(() => publishComplianceReview({
      clientId: IDS.CLIENT_A,
      repositories,
      reviewId: IDS.REVIEW_A,
      viewer: createAdminViewer(),
    })).toThrow('Review the compliance status before publishing.')
  })

  it('deletes omitted compliance records when saving', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          title: 'Old review',
        },
      ]),
      medicalApprovals: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.APPROVAL_A,
          title: 'Old approval',
        },
      ]),
    })

    const page = saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'unused',
      input: {
        complianceReviews: [],
        medicalApprovals: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.complianceReviews).toEqual([])
    expect(page.medicalApprovals).toEqual([])
  })

  it('changes compliance review status through audited domain transitions only', () => {
    const repositories = createRepositories({
      complianceReviews: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REVIEW_A,
          open_issues: 1,
          status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
          title: 'Implants tracking policy review',
        },
      ]),
    })

    const reviewPage = transitionComplianceReviewStatus({
      clientId: IDS.CLIENT_A,
      input: {
        note: 'Review started before campaign launch.',
      },
      nextStatus: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
      now: () => '2026-05-18T09:00:00.000Z',
      repositories,
      reviewId: IDS.REVIEW_A,
      viewer: createAdminViewer(),
    })

    expect(reviewPage.complianceReviews[0]).toMatchObject({
      last_updated_at: '2026-05-18T09:00:00.000Z',
      status: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
      status_history: [
        expect.objectContaining({
          actor_label: 'Agency Admin',
          changed_at: '2026-05-18T09:00:00.000Z',
          from_status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
          note: 'Review started before campaign launch.',
          to_status: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
        }),
      ],
    })

    expect(() => saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'unused',
      input: {
        complianceReviews: [
          {
            id: IDS.REVIEW_A,
            status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
            title: 'Implants tracking policy review',
          },
        ],
        medicalApprovals: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })).not.toThrow()
    expect(repositories.complianceReviews.findById(IDS.REVIEW_A)).toMatchObject({
      status: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
    })
  })

  it('blocks invalid compliance review transitions and PHI status input', () => {
    expect(() => transitionComplianceReviewStatus({
      clientId: IDS.CLIENT_A,
      nextStatus: CLINIC_COMPLIANCE_STATUSES.APPROVED,
      repositories: createRepositories({
        complianceReviews: createRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.REVIEW_A,
            status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
            title: 'Tracking policy review',
          },
        ]),
      }),
      reviewId: IDS.REVIEW_A,
      viewer: createAdminViewer(),
    })).toThrow('Compliance review transition is not allowed.')

    expect(() => transitionComplianceReviewStatus({
      clientId: IDS.CLIENT_A,
      input: { patient_name: 'Jane Patient' },
      nextStatus: CLINIC_COMPLIANCE_STATUSES.IN_REVIEW,
      repositories: createRepositories({
        complianceReviews: createRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.REVIEW_A,
            status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
            title: 'Tracking policy review',
          },
        ]),
      }),
      reviewId: IDS.REVIEW_A,
      viewer: createAdminViewer(),
    })).toThrow('Compliance review status update must stay aggregate-only.')
  })

  it('blocks invalid access, invalid references, invalid statuses, and PHI fields', () => {
    expect(() => getAdminClinicCompliancePage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Clinic compliance is only available for clinic clients.')

    expect(() => getAdminClinicCompliancePage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(IDS.AGENCY_B),
    })).toThrow('Clinic compliance is not available for this admin.')

    expect(() => saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.REVIEW_A,
      input: {
        complianceReviews: [
          {
            location_id: 'unknown-location',
            title: 'Invalid location',
          },
        ],
        medicalApprovals: [],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Compliance review location is invalid.')

    expect(() => saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.REVIEW_A,
      input: {
        complianceReviews: [
          {
            status: 'unsafe',
            title: 'Invalid status',
          },
        ],
        medicalApprovals: [],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Compliance status is invalid.')

    expect(() => saveAdminClinicCompliance({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.APPROVAL_A,
      input: {
        complianceReviews: [],
        medicalApprovals: [
          {
            patient_name: 'Jane Patient',
            title: 'PHI approval',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Medical approval must stay aggregate-only.')
  })

  it('approves medical approvals with actor, timestamp, version, and history', () => {
    const repositories = createRepositories({
      medicalApprovals: createRepository([createApproval()]),
    })

    const page = approveMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: {
        comment: 'Approved for the May landing page.',
        version: 'v2',
      },
      now: () => '2026-05-18T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.medicalApprovals[0]).toMatchObject({
      approved_at: '2026-05-18T11:00:00.000Z',
      decision_comment: 'Approved for the May landing page.',
      last_updated_at: '2026-05-18T11:00:00.000Z',
      status: CLINIC_APPROVAL_STATUSES.APPROVED,
    })
    expect(page.medicalApprovals[0].history).toEqual([
      expect.objectContaining({
        actor_label: 'Agency Admin',
        comment: 'Approved for the May landing page.',
        decision: CLINIC_APPROVAL_STATUSES.APPROVED,
        decided_at: '2026-05-18T11:00:00.000Z',
        version: 'v2',
      }),
    ])
  })

  it('requests changes and rejects medical approvals with required comments', () => {
    const repositories = createRepositories({
      medicalApprovals: createRepository([createApproval()]),
    })

    expect(() => requestChangesForMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: { comment: '' },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Decision comment is required.')

    const changesPage = requestChangesForMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: { comment: 'Remove guaranteed outcome language.' },
      now: () => '2026-05-18T12:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(changesPage.medicalApprovals[0]).toMatchObject({
      changes_requested_at: '2026-05-18T12:00:00.000Z',
      decision_comment: 'Remove guaranteed outcome language.',
      status: CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
    })

    const rejectedPage = rejectMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: { comment: 'Claim cannot be supported by the provided evidence.' },
      now: () => '2026-05-18T13:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(rejectedPage.medicalApprovals[0]).toMatchObject({
      decision_comment: 'Claim cannot be supported by the provided evidence.',
      status: CLINIC_APPROVAL_STATUSES.REJECTED,
    })
    expect(rejectedPage.medicalApprovals[0].history).toHaveLength(2)
    expect(rejectedPage.medicalApprovals[0].history[1]).toMatchObject({
      decision: CLINIC_APPROVAL_STATUSES.REJECTED,
      decided_at: '2026-05-18T13:00:00.000Z',
    })
  })

  it('blocks invalid medical approval transitions, wrong admins, and PHI decision input', () => {
    expect(() => approveMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: {},
      repositories: createRepositories({
        medicalApprovals: createRepository([
          createApproval({ status: CLINIC_APPROVAL_STATUSES.REJECTED }),
        ]),
      }),
      viewer: createAdminViewer(),
    })).toThrow('Medical approval decision is already final.')

    expect(() => approveMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: { patient_name: 'Jane Patient' },
      repositories: createRepositories({
        medicalApprovals: createRepository([createApproval()]),
      }),
      viewer: createAdminViewer(),
    })).toThrow('Medical approval decision must stay aggregate-only.')

    expect(() => expireMedicalApproval({
      approvalId: IDS.APPROVAL_A,
      clientId: IDS.CLIENT_A,
      input: {},
      repositories: createRepositories({
        medicalApprovals: createRepository([createApproval()]),
      }),
      viewer: createAdminViewer(IDS.AGENCY_B),
    })).toThrow('Clinic compliance is not available for this admin.')
  })
})
