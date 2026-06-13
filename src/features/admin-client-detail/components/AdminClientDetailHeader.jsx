import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { Icon } from '@/shared/icons'
import { Button, PageHeader, StatusBadge } from '@/shared/ui'

import { getClientStatusMeta } from '../model/clientDetailPresentation'

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function HeaderPrimaryAction({ client, onAddWorkspace }) {
  if (client.workspaceCount === 1 && client.workspaces[0]) {
    return (
      <Button asChild size="sm">
        <Link to={getDefaultWorkspaceAdminPath(client.workspaces[0])}>
          <Icon name="arrowUpRight" size={16} />
          Open workspace
        </Link>
      </Button>
    )
  }

  if (client.workspaceCount === 0) {
    return (
      <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button">
        Add workspace
      </Button>
    )
  }

  return null
}

export function AdminClientDetailHeader({
  client,
  onAddWorkspace,
  onEditClient,
}) {
  const summaryItems = [
    pluralize(client.workspaceCount, 'workspace'),
    pluralize(client.membershipCount, 'client user'),
  ]

  return (
    <div className="grid gap-item">
      <PageHeader
        actions={(
          <>
            <StatusBadge meta={getClientStatusMeta(client)} />
            <HeaderPrimaryAction client={client} onAddWorkspace={onAddWorkspace} />
            {client.workspaceCount > 0 ? (
              <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button" variant="outline">
                Add workspace
              </Button>
            ) : null}
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
      <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
        {summaryItems.map((item, index) => (
          <span className="inline-flex items-center gap-item" key={item}>
            {index > 0 ? <span className="text-text-quaternary" aria-hidden="true">/</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
