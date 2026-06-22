import { ROUTE_PATHS, withSearchParams } from '@/domain/navigation/routePaths'
import { PageHeader } from '@/shared/ui'

export function AdminWorkspacesPageHeader() {
  return (
    <PageHeader
      primaryAction={{
        children: 'Create Workspace',
        to: withSearchParams(ROUTE_PATHS.agencyWorkspaces, { createWorkspace: true }),
      }}
      title="Workspaces"
    />
  )
}
