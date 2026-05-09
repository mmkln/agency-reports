import { AdminClientOverviewEditor } from '../../../features/admin-overview-editor'

export function AdminClientOverviewPage({ routeParams = {}, runtime }) {
  return <AdminClientOverviewEditor routeParams={routeParams} runtime={runtime} />
}
