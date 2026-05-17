import { Link } from 'react-router-dom'

import {
  PageHeader,
  PageShell,
} from '@/shared/ui'

import { CLIENT_TYPES } from '../../../entities/client'
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
    clientTypes: [CLIENT_TYPES.CLINIC],
    id: 'clinic-setup',
    iconName: 'stethoscope',
    label: 'Clinic Setup',
    route: '/admin/clinic-setup',
  },
  {
    clientTypes: [CLIENT_TYPES.CLINIC],
    id: 'clinic-metrics',
    iconName: 'target',
    label: 'Clinic Metrics',
    route: '/admin/clinic-metrics',
  },
  {
    clientTypes: [CLIENT_TYPES.CLINIC],
    id: 'clinic-reputation',
    iconName: 'messageSquare',
    label: 'Reputation',
    route: '/admin/clinic-reputation',
  },
  {
    clientTypes: [CLIENT_TYPES.CLINIC],
    id: 'clinic-compliance',
    iconName: 'shieldCheck',
    label: 'Compliance',
    route: '/admin/clinic-compliance',
  },
  {
    id: 'projects',
    iconName: 'checkCircle2',
    label: 'Projects',
    route: '/admin/client-work-review',
  },
  {
    id: 'actions',
    iconName: 'bell',
    label: 'Actions',
    route: '/admin/client-requests',
  },
  {
    id: 'requests',
    iconName: 'messageSquare',
    label: 'Requests',
    route: '/admin/client-submitted-requests',
  },
  {
    id: 'reports-dashboards',
    iconName: 'barChart',
    label: 'Reports & Dashboards',
    route: '/admin/client-reports-dashboards',
  },
  {
    id: 'files-links',
    iconName: 'fileText',
    label: 'Files & Links',
    route: '/admin/client-files-links',
  },
  {
    id: 'updates',
    iconName: 'clock',
    label: 'Updates',
    route: '/admin/client-updates',
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

const clientPreviewRoutesByPage = {
  overview: '/admin/client-preview',
  projects: '/admin/client-projects-preview',
  actions: '/admin/client-action-needed-preview',
  requests: '/admin/client-requests-preview',
  'reports-dashboards': '/admin/client-reports-dashboards-preview',
  'files-links': '/admin/client-files-links-preview',
  updates: '/admin/client-updates-preview',
  access: '/admin/client-settings-preview',
  activity: '/admin/client-updates-preview',
}

function getClientField(client, camelName, snakeName) {
  return client?.[camelName] ?? client?.[snakeName] ?? ''
}

function ClientWorkspaceTabs({ client, clientId, currentPage }) {
  const visibleTabs = tabs.filter((tab) => (
    !tab.clientTypes?.length || tab.clientTypes.includes(client?.type)
  ))

  return (
    <nav aria-label="Client workspace sections" className="-mx-1 overflow-x-auto">
      <div className="flex min-w-max items-center gap-tag px-1">
        {visibleTabs.map((tab) => {
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
  width = 'full',
}) {
  const clientId = client?.id
  const portalSlug = getClientField(client, 'portalSlug', 'portal_slug')
  const primaryContactName = getClientField(client, 'primaryContactName', 'primary_contact_name')
  const primaryContactEmail = getClientField(client, 'primaryContactEmail', 'primary_contact_email')
  const previewRoute = clientPreviewRoutesByPage[currentPage] ?? clientPreviewRoutesByPage.overview
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
                  Preview published client page
                  <Icon name="arrowUpRight" size={12} />
                </Link>
              ) : null}
              {portalSlug ? <span className="text-label text-text-muted">agency.com/{portalSlug}</span> : null}
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

        <ClientWorkspaceTabs client={client} clientId={clientId} currentPage={currentPage} />
      </PageShell>
    </header>
  )
}
