import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import { REPORT_STATUSES } from '../../../entities/report'
import { TASK_STATUSES } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'

export function createBlankProject() {
  return {
    description: '',
    end_date: '',
    id: '',
    name: '',
    progress_percent: 0,
    sort_order: 10,
    start_date: '',
    status: 'in_progress',
  }
}

export function createBlankTask(projectId = '') {
  return {
    assignee_name: '',
    description: '',
    due_date: '',
    id: '',
    project_id: projectId,
    sort_order: 10,
    status: TASK_STATUSES.TODO,
    title: '',
    visibility: VISIBILITY.CLIENT_VISIBLE,
  }
}

export function createBlankUpdate(projectId = '') {
  return {
    body: '',
    id: '',
    project_id: projectId,
    title: '',
    visibility: VISIBILITY.CLIENT_VISIBLE,
  }
}

export function createBlankNeededAction() {
  return {
    description: '',
    due_date: '',
    id: '',
    related_link: '',
    status: NEEDED_ACTION_STATUSES.PENDING,
    title: '',
  }
}

export function createBlankDashboardLink() {
  return {
    description: '',
    display_order: 0,
    embed_url: '',
    fallback_message: 'Dashboard is being prepared.',
    id: '',
    last_checked_at: null,
    name: '',
    provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
    public_url: '',
    show_on_overview: true,
    status: DASHBOARD_LINK_STATUSES.DRAFT,
    visibility: VISIBILITY.CLIENT_VISIBLE,
  }
}

export function createBlankReport() {
  return {
    client_decisions_needed: '',
    dashboard_url: '',
    id: '',
    next_actions: '',
    pdf_url: '',
    period_end: '',
    period_start: '',
    problems: '',
    status: REPORT_STATUSES.DRAFT,
    summary: '',
    title: '',
    wins: '',
  }
}

export function createDraft(editor) {
  return {
    client: {
      status: editor.client.status,
    },
    currentFocus: editor.currentFocus.length > 0 ? [...editor.currentFocus] : [''],
    dashboardLinks: editor.dashboardLinks.length > 0 ? editor.dashboardLinks.map((item) => ({ ...item })) : [createBlankDashboardLink()],
    neededActions: editor.neededActions.length > 0 ? editor.neededActions.map((item) => ({ ...item })) : [createBlankNeededAction()],
    projects: editor.projects.length > 0 ? editor.projects.map((item) => ({ ...item })) : [createBlankProject()],
    reports: editor.reports.length > 0 ? editor.reports.map((item) => ({ ...item })) : [createBlankReport()],
    tasks: editor.tasks.length > 0 ? editor.tasks.map((item) => ({ ...item })) : [createBlankTask(editor.projects[0]?.id)],
    updates: editor.updates.length > 0 ? editor.updates.map((item) => ({ ...item })) : [createBlankUpdate(editor.projects[0]?.id)],
  }
}

export function updateListItem(list, index, fieldName, value) {
  return list.map((item, itemIndex) => (
    itemIndex === index ? { ...item, [fieldName]: value } : item
  ))
}

export function applyListSortOrder(list) {
  return list.map((item, index) => ({
    ...item,
    sort_order: (index + 1) * 10,
  }))
}

export function moveListItem(list, index, direction) {
  const nextIndex = index + direction

  if (nextIndex < 0 || nextIndex >= list.length) {
    return list
  }

  const nextList = [...list]
  const currentItem = nextList[index]
  nextList[index] = nextList[nextIndex]
  nextList[nextIndex] = currentItem

  return applyListSortOrder(nextList)
}

export function removeListItem(list, index, fallbackFactory) {
  const nextList = list.filter((_, itemIndex) => itemIndex !== index)

  if (nextList.length > 0 || !fallbackFactory) {
    return applyListSortOrder(nextList)
  }

  return [fallbackFactory()]
}
