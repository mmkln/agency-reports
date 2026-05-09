import { listTeamTasks } from '../../../domain/services/teamTaskService'

export function normalizeTeamTaskFilters(routeParams = {}) {
  return {
    clientId: routeParams.clientId || 'all',
    scope: routeParams.scope || 'all',
    status: routeParams.status || 'all',
    visibility: routeParams.visibility || 'all',
  }
}

export function updateTeamTaskFilters(nextFilters) {
  const params = new URLSearchParams()

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  window.location.hash = queryString ? `team-tasks?${queryString}` : 'team-tasks'
}

export function loadTeamTasks(filters, runtime) {
  return listTeamTasks({
    filters,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}
