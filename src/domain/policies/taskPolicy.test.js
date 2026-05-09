import { describe, expect, it } from 'vitest'

import { TASK_STATUSES } from '../../entities/task'
import { canTransitionTaskStatus } from './taskPolicy'

describe('canTransitionTaskStatus', () => {
  it('allows UC-001 task workflow transitions', () => {
    expect(canTransitionTaskStatus(TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.BLOCKED)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.WAITING_CLIENT)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.WAITING_CLIENT, TASK_STATUSES.IN_PROGRESS)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.BLOCKED, TASK_STATUSES.IN_PROGRESS)).toBe(true)
    expect(canTransitionTaskStatus(TASK_STATUSES.DONE, TASK_STATUSES.TODO)).toBe(true)
  })

  it('blocks unsupported task workflow transitions', () => {
    expect(canTransitionTaskStatus(TASK_STATUSES.TODO, TASK_STATUSES.DONE)).toBe(false)
    expect(canTransitionTaskStatus(TASK_STATUSES.DONE, TASK_STATUSES.IN_PROGRESS)).toBe(false)
    expect(canTransitionTaskStatus(TASK_STATUSES.BLOCKED, TASK_STATUSES.DONE)).toBe(false)
  })
})
