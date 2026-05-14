import { Button } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { PageHeader } from '../../../shared/layout/PageHeader'
import { Icon } from '../../../shared/icons'

export function AdminClientsPageHeader() {
  return (
    <PageHeader
      actions={(
        <Button asChild size="lg">
          <Link to="/admin/clients?newClient=true">
            <Icon name="plus" size={16} />
            New Client
          </Link>
        </Button>
      )}
      subtitle="Manage client portal workspaces and open client-facing status hubs."
      title="Clients"
    />
  )
}
