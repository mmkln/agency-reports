import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'New Client', to: '/admin/clients?newClient=true' }}
      title="Clients"
    />
  )
}
