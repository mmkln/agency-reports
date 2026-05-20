import {
  Badge,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '@/shared/icons'

import { formatDateTime } from './fileLinkFormatters'

const filters = [
  { label: 'Client-visible', value: 'client_visible' },
  { label: 'Internal', value: 'internal' },
  { label: 'Unavailable', value: 'unavailable' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: 'all' },
]

function getFilterCount(counts, value) {
  if (value === 'client_visible') {
    return counts.clientVisible
  }

  return counts[value] ?? 0
}

function FileLinkCard({ fileLink, onArchive, onEdit }) {
  const isArchived = fileLink.status === 'archived'

  return (
    <Panel>
      <PanelBody>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-ui text-text-primary">{fileLink.title}</h2>
            <StatusBadge meta={fileLink.typeMeta} />
            <StatusBadge meta={fileLink.statusMeta} />
            <Badge className="bg-control text-text-secondary" variant="outline">
              {fileLink.visibility === 'client_visible' ? 'Client-visible' : 'Internal'}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-normal text-text-muted">
            {fileLink.projectName ? <span>{fileLink.projectName}</span> : null}
            {fileLink.projectName ? <span aria-hidden="true">-</span> : null}
            <span>Updated {formatDateTime(fileLink.updatedAt)}</span>
            {fileLink.uploadedByName ? (
              <>
                <span aria-hidden="true">-</span>
                <span>{fileLink.uploadedByName}</span>
              </>
            ) : null}
          </div>

          {fileLink.description ? (
            <p className="mt-3 max-w-readable text-body text-text-secondary">{fileLink.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Button asChild size="sm" type="button" variant="outline">
            <a href={fileLink.url} rel="noreferrer" target="_blank">
              <Icon name="arrowUpRight" size={14} />
              Open
            </a>
          </Button>
          <Button onClick={() => onEdit(fileLink)} size="sm" type="button" variant="outline">
            Edit
          </Button>
          {!isArchived ? (
            <Button onClick={() => onArchive(fileLink)} size="sm" type="button" variant="ghost">
              Archive
            </Button>
          ) : null}
        </div>
      </div>
      </PanelBody>
    </Panel>
  )
}

export function AdminClientFilesLinksWorkspace({
  counts,
  fileLinks,
  onArchive,
  onEdit,
  onStatusFilterChange,
  statusFilter,
}) {
  return (
    <div className="grid grid-cols-1 gap-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-micro">
          {filters.map((filter) => (
            <Button
              aria-pressed={statusFilter === filter.value}
              className={statusFilter === filter.value ? 'bg-control-selected text-text-primary' : 'text-text-secondary'}
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {filter.label}
              <span className="ml-1 text-text-muted">{getFilterCount(counts, filter.value)}</span>
            </Button>
          ))}
        </div>
        <Badge className="w-fit bg-control text-text-secondary" variant="outline">
          {counts.clientVisible} visible to client
        </Badge>
      </div>

      {fileLinks.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {fileLinks.map((fileLink) => (
            <FileLinkCard
              fileLink={fileLink}
              key={fileLink.id}
              onArchive={onArchive}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <Panel>
          <PanelBody>
            <EmptyState
              description="Published deliverables, files, and shared links for the portal will appear here."
              iconName="fileText"
              title="No files or links"
            />
          </PanelBody>
        </Panel>
      )}
    </div>
  )
}
