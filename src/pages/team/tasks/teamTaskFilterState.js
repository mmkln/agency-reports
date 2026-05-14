import { listTaskWorkspace } from '../../../domain/services/taskWorkspaceService'

export function normalizeTeamTaskFilters(routeParams = {}) {
  return {
    clientId: routeParams.clientId || 'all',
    projectId: routeParams.projectId || 'all',
    search: routeParams.search || '',
    scope: routeParams.scope || 'all',
    status: routeParams.status || 'all',
    visibility: routeParams.visibility || 'all',
  }
}

export function getTeamTaskFilterPath(nextFilters, basePath = '/team/tasks') {
  const params = new URLSearchParams()

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

export function getTaskCreatePath(filters, basePath = '/team/tasks') {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.set(key, value)
    }
  })
  params.set('create', '1')

  return `${basePath}?${params.toString()}`
}

export function getTaskDetailPath(filters, taskId, basePath = '/team/tasks') {
  const listPath = getTeamTaskFilterPath(filters, basePath)
  const separator = listPath.includes('?') ? '&' : '?'

  return `${listPath}${separator}taskId=${encodeURIComponent(taskId)}`
}

export function loadTeamTasks(filters, runtime) {
  return listTaskWorkspace({
    filters,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}
