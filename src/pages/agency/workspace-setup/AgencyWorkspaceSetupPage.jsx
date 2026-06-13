import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'
import { ClientSettingsPage } from '../../client/settings/ClientSettingsPage'

export function AgencyWorkspaceSetupPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="setup"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      <ClientSettingsPage routeParams={routeParams} runtime={runtime} />
    </AdminClientWorkspaceFrame>
  )
}
