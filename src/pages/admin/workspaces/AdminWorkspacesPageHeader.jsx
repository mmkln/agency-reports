import { PageHeader } from '@/shared/ui'

export function AdminWorkspacesPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'Create Workspace', to: '/admin/workspaces?createWorkspace=true' }}
      title="Workspaces"
    />
  )
}
