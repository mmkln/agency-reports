import { AdminClientDetailWorkspace } from '@/features/admin-client-detail'

export function AdminClientDetailPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientDetailWorkspace
      routeParams={routeParams}
      runtime={runtime}
    />
  )
}
