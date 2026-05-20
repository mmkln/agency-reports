import {
  getTaskCreatePath,
  getTaskExportPath,
  getTaskImportPath,
  normalizeTeamTaskFilters,
} from './teamTaskFilterState'
import { USER_ROLES } from '../../../entities/profile'
import {
  AdminClientWorkspaceHeader,
  useAdminRouteClient,
} from '../../../features/admin-client-workspace'
import { Button, PageHeader } from '@/shared/ui'
import { Icon } from '../../../shared/icons'
import { Link } from 'react-router-dom'

function getTaskWorkspacePath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/tasks' : '/team/tasks'
}

export function TeamTasksPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const filters = normalizeTeamTaskFilters(routeParams)
  const basePath = activeRoute?.path ?? getTaskWorkspacePath(runtime.viewer)
  const routeClientId = filters.clientId && filters.clientId !== 'all' && runtime.viewer?.role === USER_ROLES.AGENCY_ADMIN
    ? filters.clientId
    : null
  const clientResource = useAdminRouteClient({
    clientId: routeClientId,
    runtime,
  })
  const client = clientResource.data
  const primaryAction = { children: 'New Task', to: getTaskCreatePath(filters, basePath) }
  const actions = (
    <>
      <Button asChild size="sm" variant="outline">
        <Link to={getTaskExportPath(filters, basePath)}>
          <Icon name="fileText" size={15} />
          Export Markdown
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={getTaskImportPath(filters, basePath)}>
          <Icon name="fileText" size={15} />
          Import Markdown
        </Link>
      </Button>
    </>
  )

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        actions={actions}
        client={client}
        currentPage="tasks"
        eyebrow="Account tasks"
        primaryAction={primaryAction}
      />
    )
  }

  return (
    <PageHeader
      actions={actions}
      primaryAction={primaryAction}
      title={activeRoute?.pageTitle ?? 'Tasks'}
    />
  )
}
