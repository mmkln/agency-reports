import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { Icon } from '@/shared/icons'
import { Button, PageHeader, StatusBadge } from '@/shared/ui'

import { getClientStatusMeta, getPreviewPortalHref } from '../model/clientDetailPresentation'

function PreviewPortalAction({ client }) {
  const href = getPreviewPortalHref(client)

  if (!href) {
    return (
      <Button disabled icon={<Icon name="arrowUpRight" size={16} />} size="sm" type="button" variant="outline">
        Preview portal
      </Button>
    )
  }

  return (
    <Button asChild size="sm" variant="outline">
      <Link to={href}>
        <Icon name="arrowUpRight" size={16} />
        Preview portal
      </Link>
    </Button>
  )
}

export function AdminClientDetailHeader({
  client,
  onAddWorkspace,
  onEditClient,
  onInviteUser,
}) {
  return (
    <PageHeader
      actions={(
        <>
          <StatusBadge meta={getClientStatusMeta(client)} />
          <Button icon={<Icon name="mail" size={16} />} onClick={onInviteUser} size="sm" type="button">
            Invite user
          </Button>
          <Button icon={<Icon name="plus" size={16} />} onClick={onAddWorkspace} size="sm" type="button" variant="outline">
            Add workspace
          </Button>
          <PreviewPortalAction client={client} />
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
