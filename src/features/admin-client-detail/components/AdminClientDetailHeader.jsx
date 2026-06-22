import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { Icon } from '@/shared/icons'
import { Button, PageHeader, StatusBadge } from '@/shared/ui'

import { getClientStatusMeta } from '../model/clientDetailPresentation'

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function AdminClientDetailHeader({
  client,
  onEditClient,
}) {
  const summaryItems = [
    pluralize(client.workspaceCount, 'workspace'),
    pluralize(client.membershipCount, 'client user'),
  ]

  return (
    <div className="grid gap-control">
      <PageHeader
        actions={(
          <>
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
        title={(
          <span className="inline-flex min-w-0 flex-wrap items-center gap-control">
            <span className="min-w-0 truncate">{client.name}</span>
            <StatusBadge meta={getClientStatusMeta(client)} />
          </span>
        )}
        titleScale="display"
        variant="inline"
      />
      <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
        {summaryItems.map((item, index) => (
          <span className="inline-flex items-center gap-item" key={item}>
            {index > 0 ? <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
