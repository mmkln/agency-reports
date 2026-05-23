import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
} from '../../entities/clinic'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { AGENCY_ROLES } from '../../entities/agency-membership'
import { TASK_STATUSES } from '../../entities/task'
import { WORKSPACE_CAPABILITIES, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  createAgencyAccessViewer,
  createWorkspaceAccessViewer,
} from '../test/accessViewerTestHelpers'
import { ACTIVITY_EVENT_TYPES } from './activityTrackingService'
import {
  answerNeededAction,
  cancelNeededAction,
  createNeededAction,
  createNeededActionFromClinicBookingSuggestion,
  createNeededActionFromClinicComplianceSuggestion,
  createNeededActionFromClinicMedicalApprovalSuggestion,
  createNeededActionFromClinicReputationSuggestion,
  createNeededActionFromTask,
  createNeededActionFromWorkItem,
  linkNeededActionToTask,
  linkNeededActionToWorkItem,
  listClientNeededActions,
  listNeededActionsWorkspace,
  listOpenNeededActionsForWorkItem,
  listWaitingClientTasksWithoutRequests,
  reopenNeededAction,
  resolveNeededAction,
  updateNeededAction,
} from './neededFromClientService'

const IDS = Object.freeze({
  ACTION: '11111111-1111-4111-8111-111111111111',
  AGENCY: '44444444-4444-4444-8444-444444444444',
  CALL_BOOKING_METRIC: '99999999-9999-4999-8999-999999999999',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  COMPLIANCE_REVIEW: '12121212-1212-4212-8212-121212121212',
  LOCATION: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  MEDICAL_APPROVAL: '13131313-1313-4313-8313-131313131313',
  OTHER_CLIENT: '77777777-7777-4777-8777-777777777777',
  REPUTATION_SNAPSHOT: '88888888-8888-4888-8888-888888888888',
  SERVICE_LINE: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  TASK: '55555555-5555-4555-8555-555555555555',
  USER: '33333333-3333-4333-8333-333333333333',
  WORK_ITEM: '66666666-6666-4666-8666-666666666666',
})

function createRepository(record) {
  let currentRecord = record

  return {
    findById(id) {
      return currentRecord?.id === id ? currentRecord : null
    },
    upsert(nextRecord) {
      currentRecord = nextRecord
      return nextRecord
    },
  }
}

function createEntityRepository(initialRecords = []) {
  const records = initialRecords.map((record) => ({ ...record }))

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByWorkspaceId(workspaceId) {
      return records.filter((record) => record.workspace_id === workspaceId || record.client_id === workspaceId)
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
  }
}

function createAdminViewer() {
  return createAgencyAccessViewer({
    agencyId: IDS.AGENCY,
    managedWorkspaceIds: [IDS.CLIENT],
    userId: 'admin-user',
  })
}

function createClientViewer() {
  return createWorkspaceAccessViewer({
    capabilities: [
      WORKSPACE_CAPABILITIES.VIEW_PORTAL,
      WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS,
    ],
    role: WORKSPACE_ROLES.MARKETING_CONTACT,
    userId: IDS.USER,
    workspaceId: IDS.CLIENT,
  })
}

function createWorkflowRepositories(overrides = {}) {
  const clients = createEntityRepository([
    {
      agency_id: IDS.AGENCY,
      id: IDS.CLIENT,
      name: 'Client A',
      type: CLIENT_TYPES.CLINIC,
    },
    {
      agency_id: IDS.AGENCY,
      id: IDS.OTHER_CLIENT,
      name: 'Client B',
      type: CLIENT_TYPES.GENERIC,
    },
  ])

  const repositories = {
    clients,
    workspaces: clients,
    complianceReviews: createEntityRepository([
      {
        blocked_items: 1,
        client_id: IDS.CLIENT,
        id: IDS.COMPLIANCE_REVIEW,
        limited_ads: 1,
        location_id: IDS.LOCATION,
        open_issues: 2,
        platform: 'Google Ads',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE,
        status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
        title: 'Implants ads policy review',
      },
    ]),
    medicalApprovals: createEntityRepository([
      {
        approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
        client_id: IDS.CLIENT,
        due_date: '2026-05-20',
        id: IDS.MEDICAL_APPROVAL,
        instructions: 'Approve the medical claim wording.',
        location_id: IDS.LOCATION,
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE,
        status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
        title: 'Implant success-rate claim',
        version: 'v1',
      },
    ]),
    callBookingMetrics: createEntityRepository([
      {
        answered_calls: 31,
        average_response_seconds: 186,
        booked_from_calls: 16,
        campaign_name: 'Implants search',
        client_id: IDS.CLIENT,
        first_time_calls: 22,
        follow_up_needed_count: 4,
        form_leads: 9,
        id: IDS.CALL_BOOKING_METRIC,
        location_id: IDS.LOCATION,
        missed_calls: 7,
        no_response_leads: 3,
        period_label: 'May 2026',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE,
        total_calls: 38,
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_ITEM,
        source_task_id: IDS.TASK,
        status: 'waiting_client',
        summary: 'Client-facing work summary.',
        target_date: '2026-05-20',
        title: 'Launch setup',
      },
    ]),
    activityEvents: createEntityRepository([]),
    neededFromClient: createEntityRepository([]),
    reputationSnapshots: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.REPUTATION_SNAPSHOT,
        location_id: IDS.LOCATION,
        negative_reviews: 2,
        period_label: 'May 2026',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        review_response_drafts: 3,
        unanswered_reviews: 4,
      },
    ]),
    tasks: createEntityRepository([
      {
        blocker_note: 'Launch is paused until the client confirms access.',
        client_id: IDS.CLIENT,
        client_safe_summary: 'We need access confirmation before launch.',
        due_date: '2026-05-20',
        id: IDS.TASK,
        project_id: '',
        status: TASK_STATUSES.WAITING_CLIENT,
        title: 'Confirm analytics access',
      },
    ]),
    ...overrides,
  }

  if (overrides.clients && !overrides.workspaces) {
    repositories.workspaces = overrides.clients
  }

  return repositories
}

describe('neededFromClientService', () => {
  it('lists client requests for agency admins by client and status', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
        {
          agency_id: 'other-agency',
          id: '55555555-5555-4555-8555-555555555555',
          name: 'Other Client',
        },
      ]),
      get workspaces() {
        return this.clients
      },
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          due_date: '2026-05-10',
          id: IDS.ACTION,
          internal_notes: 'Client should not see this.',
          priority: 'high',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve creatives',
        },
        {
          client_id: IDS.CLIENT,
          id: '66666666-6666-4666-8666-666666666666',
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved item',
        },
      ]),
    }

    const result = listNeededActionsWorkspace({
      filters: {
        clientId: IDS.CLIENT,
        status: NEEDED_ACTION_STATUSES.PENDING,
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Approve creatives'])
    expect(result.actions[0]).toMatchObject({
      clientName: 'Client A',
      priority: 'high',
      status: NEEDED_ACTION_STATUSES.PENDING,
    })
    expect(result.actions[0].internalNotes).toBe('Client should not see this.')
  })

  it('creates pending client requests for agency admins', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
      ]),
      get workspaces() {
        return this.clients
      },
      neededFromClient: createEntityRepository([]),
    }

    const createdAction = createNeededAction({
      idGenerator: () => IDS.ACTION,
      input: {
        agencyOwner: 'Mia Carter',
        clientOwner: 'Sarah Johnson',
        clientId: IDS.CLIENT,
        description: 'Please approve the next creative batch.',
        dueDate: '2026-05-10',
        impactIfDelayed: 'Launch moves by one day.',
        internalNotes: 'We need this before launch.',
        lastRemindedAt: '2026-05-09T09:00:00.000Z',
        ownerName: 'Sarah Johnson',
        priority: 'high',
        relatedLink: 'https://example.com/creative',
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
        title: 'Approve creatives',
        type: NEEDED_ACTION_TYPES.APPROVAL,
        whyNeeded: 'We need client sign-off before launch.',
      },
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(createdAction).toMatchObject({
      agency_owner: 'Mia Carter',
      client_owner: 'Sarah Johnson',
      due_date: '2026-05-10',
      impact_if_delayed: 'Launch moves by one day.',
      internal_notes: 'We need this before launch.',
      last_reminded_at: '2026-05-09T09:00:00.000Z',
      owner_name: 'Sarah Johnson',
      priority: 'high',
      related_link: 'https://example.com/creative',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Approve creatives',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      why_needed: 'We need client sign-off before launch.',
    })
    expect(repositories.neededFromClient.findById(IDS.ACTION)).toMatchObject({
      client_id: IDS.CLIENT,
    })
    expect(createdAction.response_history).toEqual([
      expect.objectContaining({
        metadata: expect.objectContaining({
          actor_role: AGENCY_ROLES.ADMIN,
          title: 'Approve creatives',
        }),
        type: 'admin_created',
      }),
    ])
  })

  it('lists only client-visible own requests for client users', () => {
    const repositories = {
      get workspaces() {
        return this.clients
      },
      clients: createEntityRepository([
        {
          id: IDS.CLIENT,
          name: 'Client A',
          portal_slug: 'client-a',
        },
      ]),
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          internal_notes: 'Internal only.',
          priority: 'high',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve creatives',
        },
        {
          client_id: IDS.CLIENT,
          id: '66666666-6666-4666-8666-666666666666',
          status: NEEDED_ACTION_STATUSES.CANCELLED,
          title: 'Cancelled request',
        },
      ]),
    }

    const result = listClientNeededActions({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Approve creatives'])
    expect(result.actions[0]).toMatchObject({
      priority: 'high',
      status: NEEDED_ACTION_STATUSES.PENDING,
    })
    expect(result.actions[0].internalNotes).toBeUndefined()
  })

  it('requires generated request ids to be string UUIDs', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
      ]),
      get workspaces() {
        return this.clients
      },
      neededFromClient: createEntityRepository([]),
    }

    expect(() => createNeededAction({
      idGenerator: () => '1',
      input: {
        clientId: IDS.CLIENT,
        title: 'Approve creatives',
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Needed action id must be a string uuid.')
  })

  it('lets agency admins update editable request fields', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        description: 'Old description',
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Old title',
      }),
    }

    const updatedAction = updateNeededAction({
      actionId: IDS.ACTION,
      input: {
        description: 'New details',
        dueDate: '2026-05-20',
        internalNotes: 'Internal follow-up note',
        ownerName: 'Sarah Johnson',
        priority: 'high',
        relatedLink: 'https://example.com/request',
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
        title: 'Updated request',
      },
      now: () => '2026-05-10T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedAction).toMatchObject({
      description: 'New details',
      due_date: '2026-05-20',
      internal_notes: 'Internal follow-up note',
      owner_name: 'Sarah Johnson',
      priority: 'high',
      related_link: 'https://example.com/request',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Updated request',
      updated_at: '2026-05-10T10:00:00.000Z',
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_updated',
      }),
    ])
  })

  it('creates needed actions from waiting-client tasks without exposing the task as the client workflow', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromTask({
      idGenerator: () => IDS.ACTION,
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      description: 'We need access confirmation before launch.',
      impact_if_delayed: 'Launch is paused until the client confirms access.',
      related_task_id: IDS.TASK,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Action needed: Confirm analytics access',
      type: NEEDED_ACTION_TYPES.OTHER,
      why_needed: 'We need access confirmation before launch.',
    })
  })

  it('creates needed actions from client work items and links source task context', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromWorkItem({
      idGenerator: () => IDS.ACTION,
      input: {
        type: NEEDED_ACTION_TYPES.ACCESS,
      },
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      description: 'Client-facing work summary.',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      title: 'Action needed: Launch setup',
      type: NEEDED_ACTION_TYPES.ACCESS,
      why_needed: 'Client-facing work summary.',
    })
  })

  it('creates needed actions from clinic booking suggestions without linking internal tasks', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromClinicBookingSuggestion({
      idGenerator: () => IDS.ACTION,
      input: {
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
      },
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      callBookingMetricId: IDS.CALL_BOOKING_METRIC,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      compliance_risk: 'Do not send patient names, phone numbers, call recordings, or patient-level attribution through the portal.',
      description: 'Confirm who calls back missed patient inquiries, how quickly same-day follow-up happens, and how follow-up is tracked.',
      impact_if_delayed: 'New patient demand may continue leaking after marketing generates calls.',
      patient_impact: 'Missed calls can become lost booked appointments.',
      priority: 'high',
      related_call_booking_metric_id: IDS.CALL_BOOKING_METRIC,
      related_campaign_name: 'Implants search',
      related_location_id: IDS.LOCATION,
      related_service_line_id: IDS.SERVICE_LINE,
      related_task_id: null,
      related_work_item_id: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Fix missed-call follow-up',
      type: NEEDED_ACTION_TYPES.DECISION,
      why_needed: '7 tracked calls were missed in May 2026.',
    })
    expect(repositories.tasks.findById(IDS.TASK)).toMatchObject({
      status: TASK_STATUSES.WAITING_CLIENT,
    })
  })

  it('rejects duplicate open clinic booking suggestion actions', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
          id: IDS.ACTION,
          related_call_booking_metric_id: IDS.CALL_BOOKING_METRIC,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve call script',
        },
      ]),
    })

    expect(() => createNeededActionFromClinicBookingSuggestion({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      repositories,
      callBookingMetricId: IDS.CALL_BOOKING_METRIC,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
      viewer: createAdminViewer(),
    })).toThrow('An open clinic booking action already exists for this suggestion.')
  })

  it('requires agency admin access and clinic clients for clinic booking suggestion actions', () => {
    const repositories = createWorkflowRepositories()

    expect(() => createNeededActionFromClinicBookingSuggestion({
      idGenerator: () => IDS.ACTION,
      repositories,
      callBookingMetricId: IDS.CALL_BOOKING_METRIC,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
      viewer: createClientViewer(),
    })).toThrow('Only admins can process needed actions.')

    const genericRepositories = createWorkflowRepositories({
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
          type: CLIENT_TYPES.GENERIC,
        },
      ]),
    })

    expect(() => createNeededActionFromClinicBookingSuggestion({
      idGenerator: () => IDS.ACTION,
      repositories: genericRepositories,
      callBookingMetricId: IDS.CALL_BOOKING_METRIC,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
      viewer: createAdminViewer(),
    })).toThrow('Clinic booking suggestions are only available for clinic clients.')
  })

  it('rejects clinic booking suggestion actions from draft metrics', () => {
    const repositories = createWorkflowRepositories({
      callBookingMetrics: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.CALL_BOOKING_METRIC,
          missed_calls: 3,
          period_label: 'May 2026',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          total_calls: 12,
        },
      ]),
    })

    expect(() => createNeededActionFromClinicBookingSuggestion({
      idGenerator: () => IDS.ACTION,
      repositories,
      callBookingMetricId: IDS.CALL_BOOKING_METRIC,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      viewer: createAdminViewer(),
    })).toThrow('Clinic booking suggestions can only be created from published metrics.')
  })

  it('creates needed actions from clinic reputation suggestions without linking internal tasks', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromClinicReputationSuggestion({
      idGenerator: () => IDS.ACTION,
      input: {
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
      },
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      reputationSnapshotId: IDS.REPUTATION_SNAPSHOT,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
      compliance_risk: 'Do not include reviewer names, patient names, appointment details, or medical context in the portal response workflow.',
      impact_if_delayed: 'Unanswered negative reviews can weaken local trust and reduce new patient conversion.',
      patient_impact: 'Patients may avoid booking if reputation concerns appear unresolved.',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_location_id: IDS.LOCATION,
      related_reputation_snapshot_id: IDS.REPUTATION_SNAPSHOT,
      related_task_id: null,
      related_work_item_id: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Respond to negative or unanswered reviews',
      type: NEEDED_ACTION_TYPES.FEEDBACK,
      why_needed: '2 negative reviews and 4 unanswered reviews were tracked in May 2026.',
    })
  })

  it('rejects duplicate open clinic reputation suggestion actions', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
          id: IDS.ACTION,
          related_reputation_snapshot_id: IDS.REPUTATION_SNAPSHOT,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve review responses',
        },
      ]),
    })

    expect(() => createNeededActionFromClinicReputationSuggestion({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      repositories,
      reputationSnapshotId: IDS.REPUTATION_SNAPSHOT,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
      viewer: createAdminViewer(),
    })).toThrow('An open clinic reputation action already exists for this suggestion.')
  })

  it('rejects clinic reputation suggestion actions from draft snapshots', () => {
    const repositories = createWorkflowRepositories({
      reputationSnapshots: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.REPUTATION_SNAPSHOT,
          negative_reviews: 1,
          period_label: 'May 2026',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          unanswered_reviews: 2,
        },
      ]),
    })

    expect(() => createNeededActionFromClinicReputationSuggestion({
      idGenerator: () => IDS.ACTION,
      repositories,
      reputationSnapshotId: IDS.REPUTATION_SNAPSHOT,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
      viewer: createAdminViewer(),
    })).toThrow('Clinic reputation suggestions can only be created from published snapshots.')
  })

  it('creates needed actions from clinic compliance review suggestions', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromClinicComplianceSuggestion({
      idGenerator: () => IDS.ACTION,
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      complianceReviewId: IDS.COMPLIANCE_REVIEW,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
      impact_if_delayed: 'Ads, landing pages, or clinic growth campaigns may remain limited until the compliance issue is resolved.',
      patient_impact: 'Clear compliant messaging helps prospective patients understand services without misleading claims.',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_campaign_name: 'Google Ads',
      related_compliance_review_id: IDS.COMPLIANCE_REVIEW,
      related_location_id: IDS.LOCATION,
      related_service_line_id: IDS.SERVICE_LINE,
      related_task_id: null,
      related_work_item_id: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Resolve compliance review issue',
      type: NEEDED_ACTION_TYPES.DECISION,
      why_needed: 'Google Ads has 4 open, blocked, or limited compliance items.',
    })
  })

  it('creates needed actions from clinic medical approval suggestions', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromClinicMedicalApprovalSuggestion({
      idGenerator: () => IDS.ACTION,
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      medicalApprovalId: IDS.MEDICAL_APPROVAL,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
      description: 'Approve the medical claim wording.',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_location_id: IDS.LOCATION,
      related_medical_approval_id: IDS.MEDICAL_APPROVAL,
      related_service_line_id: IDS.SERVICE_LINE,
      related_task_id: null,
      related_work_item_id: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Approve: Implant success-rate claim',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      why_needed: 'Approval is pending by 2026-05-20.',
    })
  })

  it('rejects duplicate open clinic compliance and approval suggestion actions', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
          id: IDS.ACTION,
          related_medical_approval_id: IDS.MEDICAL_APPROVAL,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve claim',
        },
      ]),
    })

    expect(() => createNeededActionFromClinicMedicalApprovalSuggestion({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      repositories,
      medicalApprovalId: IDS.MEDICAL_APPROVAL,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
      viewer: createAdminViewer(),
    })).toThrow('An open clinic compliance action already exists for this suggestion.')
  })

  it('rejects clinic compliance suggestions from draft records', () => {
    const repositories = createWorkflowRepositories({
      complianceReviews: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.COMPLIANCE_REVIEW,
          open_issues: 1,
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          title: 'Draft compliance review',
        },
      ]),
    })

    expect(() => createNeededActionFromClinicComplianceSuggestion({
      idGenerator: () => IDS.ACTION,
      repositories,
      complianceReviewId: IDS.COMPLIANCE_REVIEW,
      suggestionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
      viewer: createAdminViewer(),
    })).toThrow('Clinic compliance suggestions can only be created from published reviews.')
  })

  it('links existing needed actions to a task and client work item', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
      ]),
    })

    const linkedToTask = linkNeededActionToTask({
      actionId: IDS.ACTION,
      now: () => '2026-05-17T12:10:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })
    const linkedToWorkItem = linkNeededActionToWorkItem({
      actionId: IDS.ACTION,
      now: () => '2026-05-17T12:15:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(linkedToTask).toMatchObject({
      related_task_id: IDS.TASK,
    })
    expect(linkedToWorkItem).toMatchObject({
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
    })
    expect(linkedToWorkItem.response_history.map((event) => event.type)).toEqual([
      'admin_linked_task',
      'admin_linked_work_item',
    ])
  })

  it('lists open needed actions for a client work item', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
        {
          client_id: IDS.CLIENT,
          id: '88888888-8888-4888-8888-888888888888',
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved access',
        },
      ]),
    })

    const result = listOpenNeededActionsForWorkItem({
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Confirm access'])
  })

  it('lists waiting-client tasks without open linked requests', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved access',
        },
      ]),
    })

    const beforeOpenRequest = listWaitingClientTasksWithoutRequests({
      repositories,
      viewer: createAdminViewer(),
    })

    expect(beforeOpenRequest.tasks.map((task) => task.id)).toEqual([IDS.TASK])

    createNeededActionFromTask({
      idGenerator: () => IDS.ACTION,
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })

    const afterOpenRequest = listWaitingClientTasksWithoutRequests({
      repositories,
      viewer: createAdminViewer(),
    })

    expect(afterOpenRequest.tasks).toEqual([])
  })

  it('lets a client user answer a pending needed action', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creatives',
      }),
    }

    const updatedAction = answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Approved.',
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })

    expect(updatedAction).toMatchObject({
      client_response: 'Approved.',
      client_responded_at: '2026-05-09T10:00:00.000Z',
      client_responded_by: IDS.USER,
      responded_at: '2026-05-09T10:00:00.000Z',
      responded_by: IDS.USER,
      status: NEEDED_ACTION_STATUSES.ANSWERED,
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'client_answered',
      }),
    ])
  })

  it('lets a client user approve or request changes on approval actions', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creatives',
        type: NEEDED_ACTION_TYPES.APPROVAL,
      }),
    }

    const approvedAction = answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Approved for launch.',
      repositories,
      responseStatus: NEEDED_ACTION_STATUSES.APPROVED,
      viewer: createClientViewer(),
    })

    expect(approvedAction).toMatchObject({
      client_response: 'Approved for launch.',
      status: NEEDED_ACTION_STATUSES.APPROVED,
    })

    const changesRepositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Review landing page',
        type: NEEDED_ACTION_TYPES.APPROVAL,
      }),
    }

    const changesAction = answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Please update the hero copy first.',
      repositories: changesRepositories,
      responseStatus: NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
      viewer: createClientViewer(),
    })

    expect(changesAction).toMatchObject({
      client_response: 'Please update the hero copy first.',
      status: NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
    })
  })

  it('rejects approval decisions on non-approval actions', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Send access',
        type: NEEDED_ACTION_TYPES.ACCESS,
      }),
    }

    expect(() => answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Approved.',
      repositories,
      responseStatus: NEEDED_ACTION_STATUSES.APPROVED,
      viewer: createClientViewer(),
    })).toThrow('Approval decisions are only available for approval actions.')
  })

  it('keeps linked internal task status unchanged when the client responds', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_task_id: IDS.TASK,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
      ]),
    })

    answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Access confirmed.',
      repositories,
      viewer: createClientViewer(),
    })

    expect(repositories.tasks.findById(IDS.TASK)).toMatchObject({
      status: TASK_STATUSES.WAITING_CLIENT,
    })
  })

  it('records audit events for client request lifecycle changes when configured', () => {
    const repositories = createWorkflowRepositories()
    const activityIds = [
      '99999999-9999-4999-8999-999999999991',
      '99999999-9999-4999-8999-999999999992',
      '99999999-9999-4999-8999-999999999993',
    ]

    createNeededActionFromTask({
      activityIdGenerator: () => activityIds.shift(),
      idGenerator: () => IDS.ACTION,
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })
    answerNeededAction({
      actionId: IDS.ACTION,
      activityIdGenerator: () => activityIds.shift(),
      message: 'Access confirmed.',
      repositories,
      viewer: createClientViewer(),
    })
    resolveNeededAction({
      actionId: IDS.ACTION,
      activityIdGenerator: () => activityIds.shift(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(repositories.activityEvents.list().map((event) => event.event_type)).toEqual([
      ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_CREATED,
      ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
      ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_RESOLVED,
    ])
    expect(repositories.activityEvents.list()[0]).toMatchObject({
      client_id: IDS.CLIENT,
      metadata: {
        actionId: IDS.ACTION,
        relatedTaskId: IDS.TASK,
      },
    })
  })

  it('rejects agency users and closed actions when responding as the client', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
      }),
    }

    expect(() => answerNeededAction({
      actionId: IDS.ACTION,
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Only client users can respond to needed actions.')

    const closedRepositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.RESOLVED,
      }),
    }

    expect(() => answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Done.',
      repositories: closedRepositories,
      viewer: createClientViewer(),
    })).toThrow('Only pending actions can be answered.')
  })

  it('lets agency admins resolve answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.ANSWERED,
      }),
    }

    const updatedAction = resolveNeededAction({
      actionId: IDS.ACTION,
      note: 'Processed.',
      now: () => '2026-05-09T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedAction).toMatchObject({
      resolution_note: 'Processed.',
      resolved_by: 'admin-user',
      status: NEEDED_ACTION_STATUSES.RESOLVED,
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_resolved',
      }),
    ])
  })

  it('lets agency admins cancel pending or answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
      }),
    }

    const updatedAction = cancelNeededAction({
      actionId: IDS.ACTION,
      note: 'No longer needed.',
      now: () => '2026-05-09T11:30:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedAction).toMatchObject({
      cancellation_note: 'No longer needed.',
      cancelled_by: 'admin-user',
      status: NEEDED_ACTION_STATUSES.CANCELLED,
    })
  })

  it('lets agency admins reopen closed or answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        cancelled_at: '2026-05-09T11:30:00.000Z',
        cancelled_by: 'admin-user',
        cancellation_note: 'No longer needed.',
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.CANCELLED,
      }),
    }

    const updatedAction = reopenNeededAction({
      actionId: IDS.ACTION,
      note: 'Needed again.',
      now: () => '2026-05-10T11:30:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedAction).toMatchObject({
      cancellation_note: '',
      cancelled_at: null,
      cancelled_by: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      updated_at: '2026-05-10T11:30:00.000Z',
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_reopened',
      }),
    ])
  })
})
