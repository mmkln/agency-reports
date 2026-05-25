import { Link } from 'react-router-dom'

import {
  PageHeader,
  PageShell,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import {
  getClientWorkspacePageHref,
  getClientWorkspacePageLabel,
  getVisibleClientWorkspaceSections,
} from '../model'

function WorkspaceTabs({ client, currentPage, sections }) {
  const clientId = client?.id
  const pages = sections.flatMap((section) => section.pages)

  if (!clientId || pages.length === 0) {
    return null
  }

  return (
    <nav aria-label={`${client?.name ?? 'Client'} workspace`} className="flex min-w-0 items-center gap-tag overflow-x-auto">
      {pages.map((page) => {
        const isActive = page.id === currentPage
        const label = getClientWorkspacePageLabel(page, client)

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex h-control-small shrink-0 items-center gap-tag rounded-control px-control text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard',
              isActive
                ? 'bg-control-selected text-text-primary'
                : 'text-text-secondary hover:bg-control-hover hover:text-text-primary',
            ].join(' ')}
            key={page.id}
            title={label}
            to={getClientWorkspacePageHref(page, clientId)}
          >
            {page.iconName ? <Icon className="text-current" name={page.iconName} size={15} /> : null}
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminClientWorkspaceHeader({
  actions,
  client,
  currentPage = 'overview',
  eyebrow = 'Client workspace',
  primaryAction,
  width = 'full',
}) {
  const sections = getVisibleClientWorkspaceSections(client)

  return (
    <header className="sticky top-0 z-20 border-b border-separator bg-surface">
      <PageShell className="gap-control px-app-gutter py-control" width={width}>
        <PageHeader
          actions={actions}
          className="lg:items-center"
          eyebrow={eyebrow}
          primaryAction={primaryAction}
          primaryActionContext="workspace"
          title={client?.name ?? 'Client workspace'}
          variant="inline"
        />
        <WorkspaceTabs client={client} currentPage={currentPage} sections={sections} />
      </PageShell>
    </header>
  )
}
