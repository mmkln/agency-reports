import { AdminClientsWorkspace } from '@/features/admin-clients'

export function AdminClientsPage({ routeParams = {}, runtime }) {
  return <AdminClientsWorkspace routeParams={routeParams} runtime={runtime} />
}
