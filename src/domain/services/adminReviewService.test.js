import { describe, expect, it } from 'vitest'

import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import { getAdminReviewQueues } from './adminReviewService'

const IDS = Object.freeze({
  AGENCY: 'agency-a',
  CLIENT: 'client-a',
  PROJECT: 'project-a',
  TASK_BLOCKED: 'task-blocked',
  TASK_WAITING: 'task-waiting',
  TASK_WAITING_WITH_REQUEST: 'task-waiting-request',
  WORK_ARCHIVED: 'work-archived',
  WORK_DRAFT_MISSING: 'work-draft-missing',
  WORK_READY_LINKED: 'work-ready-linked',
  WORK_PUBLISHED_RECENT: 'work-published-recent',
  WORK_PUBLISHED_STALE: 'work-published-stale',
  WORK_READY: 'work-ready',
})

function createEntityRepository(initialRecords = []) {
  const records = initialRecords.map((record) => ({ ...record }))

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
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT,
        name: 'Client A',
        portal_slug: 'client-a',
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_READY,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        source_task_id: IDS.TASK_WAITING,
        status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
        summary: 'Ready for client review.',
        title: 'Ready work',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_READY_LINKED,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        source_task_id: IDS.TASK_WAITING_WITH_REQUEST,
        status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
        summary: 'Ready work with a linked request.',
        title: 'Ready work with request',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_DRAFT_MISSING,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: '',
        title: 'Missing summary work',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_PUBLISHED_STALE,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-04-01T09:00:00.000Z',
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Old published summary.',
        title: 'Stale work',
        updated_at: '2026-04-01T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_PUBLISHED_RECENT,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-15T09:00:00.000Z',
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Recent published summary.',
        title: 'Recent work',
        updated_at: '2026-05-15T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_ARCHIVED,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
        status: CLIENT_WORK_ITEM_STATUSES.DELIVERED,
        summary: 'Archived summary.',
        title: 'Archived work',
        updated_at: '2026-04-20T09:00:00.000Z',
      },
    ]),
    neededFromClient: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: 'request-linked-task',
        related_task_id: IDS.TASK_WAITING_WITH_REQUEST,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Linked request',
      },
    ]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.PROJECT,
        name: 'Campaign Setup',
      },
    ]),
    tasks: createEntityRepository([
      {
        blocker_note: 'Client approval needed.',
        client_id: IDS.CLIENT,
        client_safe_summary: '',
        id: IDS.TASK_WAITING,
        project_id: IDS.PROJECT,
        status: TASK_STATUSES.WAITING_CLIENT,
        title: 'Waiting without request',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
      {
        blocker_note: 'Client approval needed.',
        client_id: IDS.CLIENT,
        client_safe_summary: '',
        id: IDS.TASK_WAITING_WITH_REQUEST,
        project_id: IDS.PROJECT,
        status: TASK_STATUSES.WAITING_CLIENT,
        title: 'Waiting with request',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
      {
        blocker_note: 'Tracking issue.',
        client_id: IDS.CLIENT,
        client_safe_summary: '',
        id: IDS.TASK_BLOCKED,
        project_id: IDS.PROJECT,
        status: TASK_STATUSES.BLOCKED,
        title: 'Blocked without explanation',
        updated_at: '2026-05-10T09:00:00.000Z',
      },
    ]),
    ...overrides,
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user',
  }
}

describe('adminReviewService', () => {
  it('returns review queues for agency admins', () => {
    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories: createRepositories(),
      staleAfterDays: 14,
      viewer: createAdminViewer(),
    })

    expect(result.status).toBe('ready')
    expect(result.queues.readyForReview.map((item) => item.title)).toEqual(['Ready work', 'Ready work with request'])
    expect(result.queues.missingClientSummary.map((item) => item.title)).toEqual(['Missing summary work'])
    expect(result.queues.stalePublished.map((item) => item.title)).toEqual(['Stale work'])
    expect(result.queues.recentlyPublished.map((item) => item.title)).toEqual(['Recent work'])
    expect(result.queues.archived.map((item) => item.title)).toEqual(['Archived work'])
  })

  it('adds open linked client requests to review items', () => {
    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(result.queues.readyForReview.find((item) => item.workItemId === IDS.WORK_READY_LINKED)).toMatchObject({
      linkedRequests: [
        {
          id: 'request-linked-task',
          relatedTaskId: IDS.TASK_WAITING_WITH_REQUEST,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Linked request',
        },
      ],
    })
  })

  it('can scope review queues to one client', () => {
    const result = getAdminReviewQueues({
      clientId: 'other-client',
      now: () => '2026-05-17T09:00:00.000Z',
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(result.clients).toEqual([])
    expect(result.queues.readyForReview).toEqual([])
    expect(result.queues.waitingClientWithoutRequest).toEqual([])
  })

  it('detects waiting-client tasks without linked client requests', () => {
    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(result.queues.waitingClientWithoutRequest.map((item) => item.title)).toEqual(['Waiting without request'])
    expect(result.queues.waitingClientWithoutRequest[0]).toMatchObject({
      recommendedAction: 'create_client_request',
      sourceTask: {
        id: IDS.TASK_WAITING,
      },
    })
  })

  it('does not flag waiting-client tasks when the linked request is on a work item', () => {
    const repositories = createRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: 'request-linked-work',
          related_work_item_id: IDS.WORK_READY,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Linked work request',
        },
      ]),
    })

    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.queues.waitingClientWithoutRequest.map((item) => item.title)).not.toContain('Waiting without request')
  })

  it('detects blocked tasks without client-safe explanation', () => {
    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(result.queues.blockedWithoutClientExplanation.map((item) => item.title)).toEqual(['Blocked without explanation'])
    expect(result.queues.blockedWithoutClientExplanation[0].summaryStatus).toBe('missing')
  })

  it('ignores blocked tasks that already have a client-safe summary', () => {
    const repositories = createRepositories({
      tasks: createEntityRepository([
        {
          blocker_note: 'Tracking issue.',
          client_id: IDS.CLIENT,
          client_safe_summary: 'We are resolving a technical setup issue.',
          id: IDS.TASK_BLOCKED,
          project_id: IDS.PROJECT,
          status: TASK_STATUSES.BLOCKED,
          title: 'Blocked with explanation',
        },
      ]),
    })

    const result = getAdminReviewQueues({
      now: () => '2026-05-17T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.queues.blockedWithoutClientExplanation).toEqual([])
  })

  it('rejects non-admin viewers', () => {
    expect(() => getAdminReviewQueues({
      repositories: createRepositories(),
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.AGENCY_TEAM,
      },
    })).toThrow('Only agency admins can review client-facing work.')
  })
})
