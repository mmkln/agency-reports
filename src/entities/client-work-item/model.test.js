import { describe, expect, it } from 'vitest'

import { TASK_STATUSES } from '../task'
import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
  mapTaskStatusToClientWorkStatus,
  normalizeClientWorkItem,
} from './model'

describe('normalizeClientWorkItem', () => {
  it('normalizes client-facing work item fields', () => {
    const item = normalizeClientWorkItem({
      client_id: ' client-id ',
      id: ' work-id ',
      project_id: ' project-id ',
      publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
      published_by: ' admin-user ',
      sort_order: '20',
      source_task_id: ' task-id ',
      status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
      summary: ' Client-safe summary ',
      target_date: ' 2026-05-20 ',
      title: ' Active work ',
    })

    expect(item).toMatchObject({
      client_id: 'client-id',
      id: 'work-id',
      project_id: 'project-id',
      publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
      published_by: 'admin-user',
      sort_order: 20,
      source_task_id: 'task-id',
      status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
      summary: 'Client-safe summary',
      target_date: '2026-05-20',
      title: 'Active work',
    })
  })

  it('uses safe defaults for invalid status and publish state', () => {
    const item = normalizeClientWorkItem({
      publish_state: 'live',
      status: 'qa_failed',
    })

    expect(item.status).toBe(CLIENT_WORK_ITEM_STATUSES.PLANNED)
    expect(item.publish_state).toBe(CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT)
  })
})

describe('mapTaskStatusToClientWorkStatus', () => {
  it('maps internal task statuses to client-facing work statuses', () => {
    expect(mapTaskStatusToClientWorkStatus(TASK_STATUSES.TODO)).toBe(CLIENT_WORK_ITEM_STATUSES.PLANNED)
    expect(mapTaskStatusToClientWorkStatus(TASK_STATUSES.IN_PROGRESS)).toBe(CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS)
    expect(mapTaskStatusToClientWorkStatus(TASK_STATUSES.WAITING_CLIENT)).toBe(CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT)
    expect(mapTaskStatusToClientWorkStatus(TASK_STATUSES.BLOCKED)).toBe(CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION)
    expect(mapTaskStatusToClientWorkStatus(TASK_STATUSES.DONE)).toBe(CLIENT_WORK_ITEM_STATUSES.DELIVERED)
  })
})
