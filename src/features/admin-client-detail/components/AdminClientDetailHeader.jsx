import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { Icon } from '@/shared/icons'
import { Button, PageHeader, StatusBadge } from '@/shared/ui'

import { getClientStatusMeta } from '../model/clientDetailPresentation'

export function AdminClientDetailHeader({
  client,
  onAddWorkspace,
  onEditClient,
}) {
  const addWorkspaceVariant = client.workspaceCount === 0 ? 'primary' : 'outline'

  return (
    <PageHeader
      actions={(
        <>
          <StatusBadge meta={getClientStatusMeta(client)} />
          <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button" variant={addWorkspaceVariant}>
            Add workspace
          </Button>
          <Button icon={<Icon name="pencil" size={16} />} onClick={onEditClient} size="sm" type="button" variant="outline">
            Edit client
          </Button>
        </>
      )}
      eyebrow={(
        <span className="inline-flex items-center gap-tag">
          <Link className="text-text-muted hover:text-text-primary" to={ROUTE_PATHS.agencyClients}>Clients</Link>
          <span aria-hidden="true">/</span>
          <span>{client.name}</span>
        </span>
      )}
      title={client.name}
      variant="inline"
    />
  )
}
