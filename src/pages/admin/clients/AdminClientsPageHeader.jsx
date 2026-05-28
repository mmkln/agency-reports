import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'Create Workspace', to: '/admin/clients?createWorkspace=true' }}
      title="Clients"
    />
  )
}
