import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'New Client', to: '/admin/clients?newClient=true' }}
      subtitle="Manage client portal workspaces and open client-facing status hubs."
      title="Clients"
    />
  )
}
