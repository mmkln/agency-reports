import { describe, expect, it } from 'vitest'

import { TASK_STATUSES } from '../../entities/task'
import {
  canTransitionTaskStatus,
  getTaskStatusSelectionOptions,
  getTaskStatusTransitionTargets,
} from './taskPolicy'

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

describe('getTaskStatusTransitionTargets', () => {
  it('returns the domain-allowed target statuses for a saved status', () => {
    expect(getTaskStatusTransitionTargets(TASK_STATUSES.IN_PROGRESS)).toEqual([
      TASK_STATUSES.BLOCKED,
      TASK_STATUSES.DONE,
      TASK_STATUSES.WAITING_CLIENT,
    ])
    expect(getTaskStatusTransitionTargets(TASK_STATUSES.DONE)).toEqual([TASK_STATUSES.TODO])
  })
})

describe('getTaskStatusSelectionOptions', () => {
  it('includes the current status and allowed target statuses in stable selection order', () => {
    expect(getTaskStatusSelectionOptions({
      currentStatus: TASK_STATUSES.IN_PROGRESS,
    })).toEqual([
      TASK_STATUSES.IN_PROGRESS,
      TASK_STATUSES.WAITING_CLIENT,
      TASK_STATUSES.BLOCKED,
      TASK_STATUSES.DONE,
    ])
  })

  it('keeps a selected draft status available so a user can see and revert the pending value', () => {
    expect(getTaskStatusSelectionOptions({
      currentStatus: TASK_STATUSES.IN_PROGRESS,
      selectedStatus: TASK_STATUSES.BLOCKED,
    })).toEqual([
      TASK_STATUSES.IN_PROGRESS,
      TASK_STATUSES.WAITING_CLIENT,
      TASK_STATUSES.BLOCKED,
      TASK_STATUSES.DONE,
    ])
  })

  it('does not expose statuses that are not reachable from the current saved status', () => {
    expect(getTaskStatusSelectionOptions({
      currentStatus: TASK_STATUSES.TODO,
    })).toEqual([
      TASK_STATUSES.TODO,
      TASK_STATUSES.IN_PROGRESS,
    ])
  })
})
