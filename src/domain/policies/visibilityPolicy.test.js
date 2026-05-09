import { describe, expect, it } from 'vitest'

import { DASHBOARD_LINK_STATUSES } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import {
  isActiveClientTask,
  isClientVisible,
  isDashboardVisibleToClient,
  isNeededActionVisibleToClient,
  isReportVisibleToClient,
  isTaskVisibleToClient,
  isUpdateVisibleToClient,
} from './visibilityPolicy'

describe('visibilityPolicy', () => {
  it('treats explicit client-visible visibility and legacy client_visible boolean as visible', () => {
    expect(isClientVisible({ visibility: VISIBILITY.CLIENT_VISIBLE })).toBe(true)
    expect(isClientVisible({ client_visible: true })).toBe(true)
  })

  it('hides internal tasks and updates from clients', () => {
    expect(isTaskVisibleToClient({ visibility: VISIBILITY.INTERNAL })).toBe(false)
    expect(isUpdateVisibleToClient({ visibility: VISIBILITY.INTERNAL })).toBe(false)
  })

  it('treats done tasks as inactive even when client-visible', () => {
    expect(isActiveClientTask({
      status: TASK_STATUSES.IN_PROGRESS,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })).toBe(true)

    expect(isActiveClientTask({
      status: TASK_STATUSES.DONE,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })).toBe(false)
  })

  it('hides cancelled needed actions', () => {
    expect(isNeededActionVisibleToClient({ status: NEEDED_ACTION_STATUSES.PENDING })).toBe(true)
    expect(isNeededActionVisibleToClient({ status: NEEDED_ACTION_STATUSES.CANCELLED })).toBe(false)
  })

  it('shows only client-visible active or unavailable dashboards', () => {
    expect(isDashboardVisibleToClient({
      status: DASHBOARD_LINK_STATUSES.ACTIVE,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })).toBe(true)

    expect(isDashboardVisibleToClient({
      status: DASHBOARD_LINK_STATUSES.UNAVAILABLE,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })).toBe(true)

    expect(isDashboardVisibleToClient({
      status: DASHBOARD_LINK_STATUSES.DRAFT,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })).toBe(false)

    expect(isDashboardVisibleToClient({
      status: DASHBOARD_LINK_STATUSES.ACTIVE,
      visibility: VISIBILITY.INTERNAL,
    })).toBe(false)
  })

  it('shows only published or archived reports to clients', () => {
    expect(isReportVisibleToClient({ status: REPORT_STATUSES.PUBLISHED })).toBe(true)
    expect(isReportVisibleToClient({ status: REPORT_STATUSES.ARCHIVED })).toBe(true)
    expect(isReportVisibleToClient({ status: REPORT_STATUSES.DRAFT })).toBe(false)
    expect(isReportVisibleToClient({ status: REPORT_STATUSES.READY })).toBe(false)
  })
})
