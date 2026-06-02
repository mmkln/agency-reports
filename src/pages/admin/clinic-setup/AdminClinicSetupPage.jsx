import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'
import { ClientSettingsPage } from '../../client/settings/ClientSettingsPage'

export function AdminClinicSetupPage(props) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="clinic-setup"
      routeParams={props.routeParams}
      runtime={props.runtime}
      width="content"
    >
      <ClientSettingsPage {...props} />
    </AdminClientWorkspaceFrame>
  )
}
