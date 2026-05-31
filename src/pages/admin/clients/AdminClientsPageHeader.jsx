import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'Add Client', to: '/admin/clients?createClient=true' }}
      title="Clients"
    />
  )
}
