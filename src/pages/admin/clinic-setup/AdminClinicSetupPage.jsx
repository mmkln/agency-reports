import { AdminClinicSetupWorkspace } from '../../../features/admin-clinic-setup'

export function AdminClinicSetupPage({ routeParams = {}, runtime }) {
  return <AdminClinicSetupWorkspace routeParams={routeParams} runtime={runtime} />
}
