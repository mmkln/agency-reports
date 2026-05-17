import { DASHBOARD_LINK_STATUSES } from '../../entities/dashboard-link'
import { CLIENT_FILE_LINK_STATUSES } from '../../entities/client-file-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { canClientViewPerformanceDashboardPeriod } from '../../entities/performance-dashboard'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'

export function isClientVisible(record) {
  return record?.visibility === VISIBILITY.CLIENT_VISIBLE || record?.client_visible === true
}

export function isTaskVisibleToClient(task) {
  return isClientVisible(task)
}

export function isActiveClientTask(task) {
  return isTaskVisibleToClient(task) && task.status !== TASK_STATUSES.DONE
}

export function isUpdateVisibleToClient(update) {
  return isClientVisible(update)
}

export function isNeededActionVisibleToClient(action) {
  return action?.status !== NEEDED_ACTION_STATUSES.CANCELLED
}

export function isDashboardVisibleToClient(dashboardLink) {
  if (!isClientVisible(dashboardLink)) {
    return false
  }

  return [
    DASHBOARD_LINK_STATUSES.ACTIVE,
    DASHBOARD_LINK_STATUSES.UNAVAILABLE,
  ].includes(dashboardLink.status)
}

export function isClientFileLinkVisibleToClient(fileLink) {
  if (!isClientVisible(fileLink)) {
    return false
  }

  return [
    CLIENT_FILE_LINK_STATUSES.ACTIVE,
    CLIENT_FILE_LINK_STATUSES.UNAVAILABLE,
  ].includes(fileLink.status)
}

export function isReportVisibleToClient(report) {
  return [
    REPORT_STATUSES.PUBLISHED,
    REPORT_STATUSES.ARCHIVED,
  ].includes(report?.status)
}

export function isPerformanceDashboardPeriodVisibleToClient(period) {
  return canClientViewPerformanceDashboardPeriod(period)
}
