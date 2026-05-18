import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import { CLINIC_RECORD_PUBLISH_STATES } from '../../entities/clinic'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import {
  getAdminClinicReputationPage,
  publishReputationSnapshot,
  saveAdminClinicReputation,
} from './adminClinicReputationService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  LOCATION_A: '55555555-5555-4555-8555-555555555555',
  SNAPSHOT_A: '66666666-6666-4666-8666-666666666666',
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
    neededFromClient: createRepository([]),
    reputationSnapshots: createRepository([]),
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

describe('adminClinicReputationService', () => {
  it('reads aggregate reputation snapshots with location context', () => {
    const repositories = createRepositories({
      reputationSnapshots: createRepository([
        {
          client_id: IDS.CLIENT_A,
          google_rating: 4.7,
          id: IDS.SNAPSHOT_A,
          location_id: IDS.LOCATION_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          review_count: 184,
          reviews_gained: 14,
        },
      ]),
    })

    const page = getAdminClinicReputationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.client.name).toBe('Green Dental Clinic')
    expect(page.locations).toHaveLength(1)
    expect(page.reputationSnapshots[0]).toMatchObject({
      google_rating: 4.7,
      location_id: IDS.LOCATION_A,
      reputation_action_suggestions: [],
      review_count: 184,
    })
  })

  it('marks existing open reputation actions in reputation suggestions', () => {
    const repositories = createRepositories({
      neededFromClient: createRepository([
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
          id: 'action-open-review-response',
          related_reputation_snapshot_id: IDS.SNAPSHOT_A,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Respond to negative review',
        },
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
          id: 'action-resolved-review-approval',
          related_reputation_snapshot_id: IDS.SNAPSHOT_A,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Old review approval',
        },
      ]),
      reputationSnapshots: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT_A,
          negative_reviews: 2,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          review_response_drafts: 3,
          unanswered_reviews: 4,
        },
      ]),
    })

    const page = getAdminClinicReputationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.reputationSnapshots[0].reputation_action_suggestions).toEqual([
      {
        actionLabel: 'Create review response action',
        defaultActionType: NEEDED_ACTION_TYPES.FEEDBACK,
        hasOpenAction: true,
        openAction: {
          id: 'action-open-review-response',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Respond to negative review',
        },
        type: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
      },
      {
        actionLabel: 'Create review approval action',
        defaultActionType: NEEDED_ACTION_TYPES.APPROVAL,
        hasOpenAction: false,
        openAction: null,
        type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
      },
    ])
  })

  it('saves reputation snapshots as aggregate clinic data', () => {
    const repositories = createRepositories()

    const page = saveAdminClinicReputation({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.SNAPSHOT_A,
      input: {
        reputationSnapshots: [
          {
            data_source: 'Manual GBP rollup',
            gbp_updates: '3',
            google_rating: '4.8',
            insight: 'Review request follow-up increased response volume.',
            local_visibility_note: 'Map visibility improved for implant searches.',
            location_id: IDS.LOCATION_A,
            negative_reviews: '1',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            provider_profile_completeness: '90',
            review_count: '184',
            review_request_sent: '42',
            review_response_drafts: '3',
            reviews_gained: '14',
            summary: 'Reputation improved across the main profile.',
            unanswered_reviews: '2',
          },
        ],
      },
      now: () => '2026-05-17T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.reputationSnapshots[0]).toMatchObject({
      client_id: IDS.CLIENT_A,
      google_rating: 4.8,
      id: IDS.SNAPSHOT_A,
      last_updated_at: '2026-05-17T10:00:00.000Z',
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      provider_profile_completeness: 90,
      reviews_gained: 14,
    })
  })

  it('publishes reputation snapshots with audit metadata', () => {
    const repositories = createRepositories({
      reputationSnapshots: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          review_count: 184,
        },
      ]),
    })

    const page = publishReputationSnapshot({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      snapshotId: IDS.SNAPSHOT_A,
      viewer: createAdminViewer(),
    })

    expect(page.reputationSnapshots[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:00:00.000Z',
      published_by: 'admin-user-id',
    })
  })

  it('deletes omitted reputation snapshots when saving', () => {
    const repositories = createRepositories({
      reputationSnapshots: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT_A,
          period_end: '2026-04-30',
          period_label: 'April 2026',
          period_start: '2026-04-01',
        },
      ]),
    })

    const page = saveAdminClinicReputation({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'unused',
      input: {
        reputationSnapshots: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.reputationSnapshots).toEqual([])
  })

  it('blocks invalid access, generic clients, invalid location, invalid rating, and PHI fields', () => {
    expect(() => getAdminClinicReputationPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Clinic reputation is only available for clinic clients.')

    expect(() => getAdminClinicReputationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(IDS.AGENCY_B),
    })).toThrow('Clinic reputation is not available for this admin.')

    expect(() => saveAdminClinicReputation({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.SNAPSHOT_A,
      input: {
        reputationSnapshots: [
          {
            location_id: 'unknown-location',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Reputation location is invalid.')

    expect(() => saveAdminClinicReputation({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.SNAPSHOT_A,
      input: {
        reputationSnapshots: [
          {
            google_rating: '7',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Google rating must be between 0 and 5.')

    expect(() => saveAdminClinicReputation({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.SNAPSHOT_A,
      input: {
        reputationSnapshots: [
          {
            patient_phone: '+1 555 0100',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Reputation snapshot must stay aggregate-only.')
  })
})
