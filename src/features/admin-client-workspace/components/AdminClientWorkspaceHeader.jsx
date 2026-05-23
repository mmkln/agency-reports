import { Link } from 'react-router-dom'

import {
  PageHeader,
  PageShell,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import {
  getClientWorkspacePreviewRoute,
  getVisibleClientWorkspaceSections,
} from '../model'
import { ClientStatusSelector } from './ClientStatusSelector'

function getClientField(client, camelName, snakeName) {
  return client?.[camelName] ?? client?.[snakeName] ?? ''
}

export function AdminClientWorkspaceHeader({
  actions,
  client,
  currentPage = 'overview',
  eyebrow = 'Account workspace',
  onStatusChange,
  primaryAction,
  width = 'full',
}) {
  const clientId = client?.id
  const portalSlug = getClientField(client, 'portalSlug', 'portal_slug')
  const primaryContactName = getClientField(client, 'primaryContactName', 'primary_contact_name')
  const primaryContactEmail = getClientField(client, 'primaryContactEmail', 'primary_contact_email')
  const sections = getVisibleClientWorkspaceSections(client)
  const previewRoute = getClientWorkspacePreviewRoute(sections, currentPage)
  const status = client?.status

  return (
    <header className="sticky top-0 z-20 border-b border-separator bg-surface">
      <PageShell className="gap-control px-app-gutter py-control" width={width}>
        <PageHeader
          actions={(
            <>
              <ClientStatusSelector onSelect={onStatusChange} status={status} />
              {portalSlug ? (
                <Link
                  className="inline-flex h-control-small items-center gap-1 text-label text-link no-underline hover:text-link-hover"
                  to={`${previewRoute}?clientId=${clientId}`}
                >
                  Preview published portal page
                  <Icon name="arrowUpRight" size={12} />
                </Link>
              ) : null}
              {portalSlug ? <span className="text-label text-text-muted">portal/{portalSlug}</span> : null}
              {primaryContactName ? <span className="text-label text-text-muted">{primaryContactName}</span> : null}
              {primaryContactEmail ? <span className="text-label text-text-muted">{primaryContactEmail}</span> : null}
              {actions}
            </>
          )}
          className="lg:items-center"
          eyebrow={eyebrow}
          primaryAction={primaryAction}
          primaryActionContext="workspace"
          title={client?.name ?? 'Account workspace'}
          variant="inline"
        />
      </PageShell>
    </header>
  )
}
