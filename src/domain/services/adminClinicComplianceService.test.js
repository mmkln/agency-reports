import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import {
  getAdminClinicCompliancePage,
  saveAdminClinicCompliance,
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
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    agencyId,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user-id',
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
      open_issues: 2,
      status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
    })
    expect(page.medicalApprovals[0]).toMatchObject({
      approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
      status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    })
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
      title: 'Implant success-rate claim',
    })
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
})
