import { AdminReportsWorkspace } from '../../../features/admin-reports'

export function AdminReportsPage({ routeParams = {}, runtime }) {
  return <AdminReportsWorkspace routeParams={routeParams} runtime={runtime} />
}
