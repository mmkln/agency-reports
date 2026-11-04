import {
  AdminClientWorkspaceFrame,
  WorkspaceDataNavigation,
} from '@/features/admin-client-workspace'
import { WorkspaceTagCatalog } from '@/features/workspace-tag-catalog'

export function AgencyWorkspaceTagCatalogPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="tag-catalog"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      {({ workspaceId }) => (
        <div className="grid gap-card">
          <WorkspaceDataNavigation currentPage="tag-catalog" workspaceId={workspaceId} />
          <WorkspaceTagCatalog
            apiClient={runtime.apiClient}
            workspaceId={workspaceId}
          />
        </div>
      )}
    </AdminClientWorkspaceFrame>
  )
}
