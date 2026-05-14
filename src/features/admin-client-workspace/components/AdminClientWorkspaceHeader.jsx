import { Link } from 'react-router-dom'

import {
  Button,
  FoundationPageHeader,
  PageShell,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_STATUS_META } from '../../../entities/client'
import { Icon } from '../../../shared/icons'

const tabs = [
  {
    id: 'overview',
    iconName: 'fileText',
    label: 'Overview',
    route: '/admin/client-overview',
  },
  {
    id: 'access',
    iconName: 'users',
    label: 'Access',
    route: '/admin/client-access',
  },
  {
    id: 'activity',
    iconName: 'clock',
    label: 'Activity',
    route: '/admin/client-activity',
  },
]

function getClientField(client, camelName, snakeName) {
  return client?.[camelName] ?? client?.[snakeName] ?? ''
}

export function AdminClientWorkspaceHeader({
  actions,
  client,
  currentPage = 'overview',
  eyebrow = 'Client workspace',
}) {
  const clientId = client?.id
  const portalSlug = getClientField(client, 'portalSlug', 'portal_slug')
  const primaryContactName = getClientField(client, 'primaryContactName', 'primary_contact_name')
  const primaryContactEmail = getClientField(client, 'primaryContactEmail', 'primary_contact_email')
  const status = client?.status
  const statusMeta = CLIENT_STATUS_META[status] ?? {
    label: status || 'Unknown',
    tone: 'neutral',
  }

  return (
    <header className="border-b border-separator bg-surface">
      <PageShell className="gap-component px-4 py-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted">
          <Link className="text-link no-underline hover:text-link-hover" to="/admin/clients">
            Clients
          </Link>
          <Icon className="text-text-quaternary" name="arrowRight" size={12} />
          <span className="truncate text-text-secondary">{client?.name ?? 'Client workspace'}</span>
          <Icon className="text-text-quaternary" name="arrowRight" size={12} />
          <span className="font-medium text-text-primary">
            {tabs.find((tab) => tab.id === currentPage)?.label ?? 'Overview'}
          </span>
        </nav>

        <FoundationPageHeader
          actions={(
            <div className="flex flex-wrap items-center justify-end gap-control">
              <StatusBadge meta={statusMeta} />
              {actions}
            </div>
          )}
          className="lg:items-center"
          eyebrow={eyebrow}
          title={client?.name ?? 'Client workspace'}
        />

        <div className="flex flex-col gap-component lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
            {portalSlug ? (
              <Link
                className="inline-flex items-center gap-1 text-link no-underline hover:text-link-hover"
                to={`/admin/client-preview?clientId=${clientId}`}
              >
                agency.com/{portalSlug}
                <Icon name="arrowUpRight" size={12} />
              </Link>
            ) : null}
            {primaryContactName ? <span>{primaryContactName}</span> : null}
            {primaryContactEmail ? <span>{primaryContactEmail}</span> : null}
          </div>

          <div className="flex flex-wrap gap-control">
            {tabs.map((tab) => {
              const isActive = currentPage === tab.id

              return (
                <Button
                  asChild
                  key={tab.id}
                  size="sm"
                  variant={isActive ? 'secondary' : 'ghost'}
                >
                  <Link to={`${tab.route}?clientId=${clientId}`}>
                    <Icon name={tab.iconName} size={15} />
                    {tab.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </PageShell>
    </header>
  )
}
