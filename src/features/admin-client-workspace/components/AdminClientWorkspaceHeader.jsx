import { Link } from 'react-router-dom'

import {
  PageHeader,
  PageShell,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { ClientStatusSelector } from './ClientStatusSelector'

const tabs = [
  {
    id: 'overview',
    iconName: 'fileText',
    label: 'Overview',
    route: '/admin/client-overview',
  },
  {
    id: 'tasks',
    iconName: 'checkCircle2',
    label: 'Tasks',
    route: '/admin/tasks',
  },
  {
    id: 'requests',
    iconName: 'messageSquare',
    label: 'Requests',
    route: '/admin/client-requests',
  },
  {
    id: 'dashboards',
    iconName: 'layoutDashboard',
    label: 'Dashboards',
    route: '/admin/dashboard-links',
  },
  {
    id: 'reports',
    iconName: 'fileText',
    label: 'Reports',
    route: '/admin/reports',
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

function ClientWorkspaceTabs({ clientId, currentPage }) {
  return (
    <nav aria-label="Client workspace sections" className="-mx-1 overflow-x-auto">
      <div className="flex min-w-max items-center gap-tag px-1">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex h-control-small items-center gap-tag rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard ${
                isActive
                  ? 'bg-control-selected text-text-primary'
                  : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
              }`}
              key={tab.id}
              to={`${tab.route}?clientId=${clientId}`}
            >
              <Icon
                aria-hidden="true"
                className={isActive ? 'text-text-primary' : 'text-text-quaternary'}
                name={tab.iconName}
                size={14}
              />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AdminClientWorkspaceHeader({
  actions,
  client,
  currentPage = 'overview',
  eyebrow = 'Client workspace',
  onStatusChange,
  primaryAction,
}) {
  const clientId = client?.id
  const portalSlug = getClientField(client, 'portalSlug', 'portal_slug')
  const primaryContactName = getClientField(client, 'primaryContactName', 'primary_contact_name')
  const primaryContactEmail = getClientField(client, 'primaryContactEmail', 'primary_contact_email')
  const status = client?.status

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

        <PageHeader
          actions={(
            <>
              <ClientStatusSelector onSelect={onStatusChange} status={status} />
              {actions}
            </>
          )}
          className="lg:items-center"
          eyebrow={eyebrow}
          primaryAction={primaryAction}
          primaryActionContext="workspace"
          title={client?.name ?? 'Client workspace'}
          variant="inline"
        />

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

        <ClientWorkspaceTabs clientId={clientId} currentPage={currentPage} />
      </PageShell>
    </header>
  )
}
