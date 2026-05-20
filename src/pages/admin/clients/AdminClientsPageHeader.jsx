import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{ children: 'New Account', to: '/admin/clients?newClient=true' }}
      title="Accounts"
    />
  )
}
