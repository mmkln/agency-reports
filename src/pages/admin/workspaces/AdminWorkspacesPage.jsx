import { AdminWorkspacesWorkspace } from '@/features/admin-workspaces'

export function AdminWorkspacesPage({ routeParams = {}, runtime }) {
  return <AdminWorkspacesWorkspace routeParams={routeParams} runtime={runtime} />
}
