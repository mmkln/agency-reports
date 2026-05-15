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
    id: 'performance',
    iconName: 'barChart',
    label: 'Performance',
    route: '/admin/performance-dashboards',
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
                  ? 'bg-fill-secondary text-text-primary'
                  : 'text-text-secondary hover:bg-fill-tertiary hover:text-text-primary'
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
    <header className="sticky top-0 z-20 border-b border-separator bg-surface">
      <PageShell className="gap-control px-app-gutter py-control">
        <PageHeader
          actions={(
            <>
              <ClientStatusSelector onSelect={onStatusChange} status={status} />
              {portalSlug ? (
                <Link
                  className="inline-flex h-control-small items-center gap-1 text-label text-link no-underline hover:text-link-hover"
                  to={`/admin/client-preview?clientId=${clientId}`}
                >
                  agency.com/{portalSlug}
                  <Icon name="arrowUpRight" size={12} />
                </Link>
              ) : null}
              {primaryContactName ? <span className="text-label text-text-muted">{primaryContactName}</span> : null}
              {primaryContactEmail ? <span className="text-label text-text-muted">{primaryContactEmail}</span> : null}
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

        <ClientWorkspaceTabs clientId={clientId} currentPage={currentPage} />
      </PageShell>
    </header>
  )
}
