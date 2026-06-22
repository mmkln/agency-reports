import { ROUTE_PATHS, withSearchParams } from '@/domain/navigation/routePaths'
import { PageHeader } from '@/shared/ui'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      primaryAction={{
        children: 'Add Client',
        to: withSearchParams(ROUTE_PATHS.agencyClients, { createClient: true }),
      }}
      title="Clients"
    />
  )
}
