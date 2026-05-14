import {
  getTaskCreatePath,
  normalizeTeamTaskFilters,
} from './teamTaskFilterState'
import { USER_ROLES } from '../../../entities/profile'
import { listAdminClients } from '../../../domain/services/adminClientService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { PageHeader } from '@/shared/ui'

function getTaskWorkspacePath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/tasks' : '/team/tasks'
}

function getRouteClient(clientId, runtime) {
  if (!clientId || clientId === 'all' || runtime.viewer?.role !== USER_ROLES.AGENCY_ADMIN) {
    return null
  }

  return listAdminClients({
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }).find((client) => client.id === clientId) ?? null
}

export function TeamTasksPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const filters = normalizeTeamTaskFilters(routeParams)
  const basePath = activeRoute?.path ?? getTaskWorkspacePath(runtime.viewer)
  const client = getRouteClient(filters.clientId, runtime)
  const primaryAction = { children: 'New Task', to: getTaskCreatePath(filters, basePath) }

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="tasks"
        eyebrow="Client tasks"
        primaryAction={primaryAction}
      />
    )
  }

  return (
    <PageHeader
      primaryAction={primaryAction}
      title={activeRoute?.pageTitle ?? 'Tasks'}
    />
  )
}
