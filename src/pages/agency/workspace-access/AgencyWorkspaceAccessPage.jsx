import { AccessMembersPanel, InvitationsPanel } from '@/features/admin-client-access'
import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'

export function AgencyWorkspaceAccessPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="access"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      {({ workspaceId }) => (
        <div className="grid gap-card">
          <InvitationsPanel runtime={runtime} workspaceId={workspaceId} />
          <AccessMembersPanel clientId={workspaceId} runtime={runtime} />
        </div>
      )}
    </AdminClientWorkspaceFrame>
  )
}
