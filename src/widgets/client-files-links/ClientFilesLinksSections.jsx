import { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  EmptyState,
  FilterTabs,
  StatusBadge,
} from '@/shared/ui'

import {
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_TYPES,
} from '../../entities/client-file-link'
import { Icon } from '../../shared/icons'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Deliverables', value: CLIENT_FILE_LINK_TYPES.DELIVERABLE },
  { label: 'Client uploads', value: CLIENT_FILE_LINK_TYPES.CLIENT_UPLOAD },
  { label: 'Reports', value: CLIENT_FILE_LINK_TYPES.REPORT },
  { label: 'Brand assets', value: CLIENT_FILE_LINK_TYPES.BRAND_ASSET },
  { label: 'Shared links', value: CLIENT_FILE_LINK_TYPES.SHARED_LINK },
  { label: 'Contracts/admin', value: CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN },
  { label: 'Archived', value: CLIENT_FILE_LINK_STATUSES.ARCHIVED },
]

function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function getFilterCount({ counts, value }) {
  return {
    all: counts.all,
    archived: counts.archived,
    brand_asset: counts.brandAssets,
    client_upload: counts.clientUploads,
    contract_admin: counts.contractsAdmin,
    deliverable: counts.deliverables,
    report: counts.reports,
    shared_link: counts.sharedLinks,
  }[value]
}

function FileLinkFilters({ activeFilter, counts, onChange }) {
  const items = filters.map((filter) => ({
    count: getFilterCount({
      counts,
      value: filter.value,
    }) ?? 0,
    label: filter.label,
    value: filter.value,
  }))

  return (
    <FilterTabs
      ariaLabel="File and link type filters"
      items={items}
      onValueChange={onChange}
      value={activeFilter}
    />
  )
}

function FileLinkCard({ fileLink }) {
  return (
    <article className="rounded-block bg-block px-card py-component shadow-none">
      <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-item flex flex-wrap items-center gap-item">
            <StatusBadge meta={fileLink.typeMeta} />
          </div>
          <h3 className="text-ui font-semibold text-text-primary">{fileLink.title}</h3>
          {fileLink.description ? (
            <p className="mt-item line-clamp-3 max-w-readable text-ui font-normal text-text-secondary">{fileLink.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-item">
          <StatusBadge meta={fileLink.statusMeta} />
        </div>
      </div>

      <div className="mt-component flex flex-col gap-item sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-label font-normal text-text-muted">
          {fileLink.projectName ? <span>{fileLink.projectName}</span> : null}
          {fileLink.relatedReportTitle ? <span>{fileLink.relatedReportTitle}</span> : null}
          {fileLink.fileName ? <span>{fileLink.fileName}</span> : null}
          {fileLink.uploadedByName ? <span>By {fileLink.uploadedByName}</span> : null}
          <span>Updated {formatDate(fileLink.updatedAt)}</span>
        </div>
        {fileLink.url ? (
          <Button asChild className="shrink-0" size="sm" variant="ghost">
            <a href={fileLink.url} rel="noreferrer" target="_blank">
              Open
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  )
}

export function FilesLinksLibrary({ counts, fileLinks }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredFileLinks = useMemo(() => {
    if (activeFilter === CLIENT_FILE_LINK_STATUSES.ARCHIVED) {
      return fileLinks.filter((fileLink) => fileLink.status === CLIENT_FILE_LINK_STATUSES.ARCHIVED)
    }

    const activeFileLinks = fileLinks.filter((fileLink) => (
      fileLink.status !== CLIENT_FILE_LINK_STATUSES.ARCHIVED
    ))

    return activeFilter === 'all'
      ? activeFileLinks
      : activeFileLinks.filter((fileLink) => fileLink.type === activeFilter)
  }, [activeFilter, fileLinks])

  return (
    <section className="grid gap-card">
      <div className="flex flex-col gap-component sm:flex-row sm:items-center sm:justify-between">
        <FileLinkFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />
        <Badge className="w-fit" tone="neutral">{fileLinks.length} resource{fileLinks.length === 1 ? '' : 's'}</Badge>
      </div>

      {filteredFileLinks.length ? (
        <div className="grid gap-card">
          {filteredFileLinks.map((fileLink) => (
            <FileLinkCard fileLink={fileLink} key={fileLink.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="bg-block-subtle"
          description={activeFilter === CLIENT_FILE_LINK_STATUSES.ARCHIVED
            ? 'No archived client resources are available.'
            : 'No published client resources match this view.'}
          iconName="fileText"
          title="No resources here"
        />
      )}
    </section>
  )
}
