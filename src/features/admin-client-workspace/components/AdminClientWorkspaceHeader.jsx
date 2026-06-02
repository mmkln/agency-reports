import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
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
    <nav aria-label={`${client?.name ?? 'Client'} workspace sections`} className="flex min-w-0 items-center gap-control overflow-x-auto">
      {pages.map((page) => {
        const isActive = page.id === currentPage
        const label = getClientWorkspacePageLabel(page, client)

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-control-small shrink-0 items-center gap-tag rounded-item px-item text-label font-medium no-underline transition-colors duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
              isActive
                ? 'text-text-primary'
                : 'text-text-muted hover:bg-control-hover hover:text-text-primary',
            )}
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
  primaryAction,
  width = 'full',
}) {
  const sections = getVisibleClientWorkspaceSections(client)

  return (
    <header className="sticky top-0 z-20 border-b border-separator bg-surface">
      <PageShell className="gap-tag px-app-gutter py-item" width={width}>
        <PageHeader
          actions={actions}
          className="gap-micro lg:items-center"
          eyebrow={null}
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
