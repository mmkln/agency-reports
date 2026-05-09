import { Button } from '@/components/ui/button'

import { PageHeader } from '../../../shared/layout/PageHeader'
import { Icon } from '../../../shared/icons'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      actions={(
        <Button asChild size="lg">
          <a href="#admin-clients?newClient=true">
            <Icon name="plus" size={16} />
            New Client
          </a>
        </Button>
      )}
      subtitle="Manage client portal workspaces and open client-facing status hubs."
      title="Clients"
    />
  )
}
