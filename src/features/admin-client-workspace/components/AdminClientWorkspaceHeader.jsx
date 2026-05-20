import { Link } from 'react-router-dom'

import {
  PageHeader,
  PageShell,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import {
  getActiveClientWorkspaceSection,
  getClientWorkspacePageHref,
  getClientWorkspacePageLabel,
  getClientWorkspacePreviewRoute,
  getClientWorkspaceSectionHref,
  getVisibleClientWorkspaceSections,
} from '../model'
import { ClientStatusSelector } from './ClientStatusSelector'

function getClientField(client, camelName, snakeName) {
  return client?.[camelName] ?? client?.[snakeName] ?? ''
}

function ClientWorkspaceNavigation({ activeSection, client, clientId, currentPage, sections }) {
  const showSecondaryNavigation = activeSection?.pages.length > 1

  return (
    <div className="grid gap-tag">
      <nav aria-label="Account workspace sections" className="-mx-1 overflow-x-auto">
        <div className="flex min-w-max items-center gap-tag px-1">
          {sections.map((section) => {
            const isActive = activeSection?.id === section.id

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-control-small items-center gap-tag rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard ${
                  isActive
                    ? 'bg-fill-secondary text-text-primary'
                    : 'text-text-secondary hover:bg-fill-tertiary hover:text-text-primary'
                }`}
                key={section.id}
                to={getClientWorkspaceSectionHref(section, clientId)}
              >
                <Icon
                  aria-hidden="true"
                  className={isActive ? 'text-text-primary' : 'text-text-quaternary'}
                  name={section.iconName}
                  size={14}
                />
                <span>{section.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {showSecondaryNavigation ? (
        <nav aria-label={`${activeSection.label} sections`} className="-mx-1 overflow-x-auto">
          <div className="flex min-w-max items-center gap-tag px-1">
            {activeSection.pages.map((page) => {
              const isActive = currentPage === page.id

              return (
                <Link
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex h-control-small items-center rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard ${
                    isActive
                      ? 'bg-control text-text-primary'
                      : 'text-text-muted hover:bg-fill-tertiary hover:text-text-primary'
                  }`}
                  key={page.id}
                  to={getClientWorkspacePageHref(page, clientId)}
                >
                  {getClientWorkspacePageLabel(page, client)}
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
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
  const activeSection = getActiveClientWorkspaceSection(sections, currentPage)
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

        <ClientWorkspaceNavigation
          activeSection={activeSection}
          client={client}
          clientId={clientId}
          currentPage={currentPage}
          sections={sections}
        />
      </PageShell>
    </header>
  )
}
