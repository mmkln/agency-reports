import { AdminClinicComplianceWorkspace } from '../../../features/admin-clinic-compliance'

export function AdminClinicCompliancePage({ routeParams = {}, runtime }) {
  return <AdminClinicComplianceWorkspace routeParams={routeParams} runtime={runtime} />
}
