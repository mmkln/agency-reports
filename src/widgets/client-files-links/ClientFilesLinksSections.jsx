import { useMemo, useState } from 'react'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_FILE_LINK_TYPES } from '../../entities/client-file-link'
import { Icon } from '../../shared/icons'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Deliverables', value: CLIENT_FILE_LINK_TYPES.DELIVERABLE },
  { label: 'Client uploads', value: CLIENT_FILE_LINK_TYPES.CLIENT_UPLOAD },
  { label: 'Reports', value: CLIENT_FILE_LINK_TYPES.REPORT },
  { label: 'Brand assets', value: CLIENT_FILE_LINK_TYPES.BRAND_ASSET },
  { label: 'Shared links', value: CLIENT_FILE_LINK_TYPES.SHARED_LINK },
  { label: 'Contracts/admin', value: CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN },
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
    brand_asset: counts.brandAssets,
    client_upload: counts.clientUploads,
    contract_admin: counts.contractsAdmin,
    deliverable: counts.deliverables,
    report: counts.reports,
    shared_link: counts.sharedLinks,
  }[value]
}

function FileLinkFilters({ activeFilter, counts, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max items-center gap-tag">
        {filters.map((filter) => {
          const selected = activeFilter === filter.value
          const count = getFilterCount({
            counts,
            value: filter.value,
          })

          return (
            <Button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              size="sm"
              type="button"
              variant={selected ? 'primary' : 'ghost'}
            >
              {filter.label}
              <span className="ml-1 text-label font-normal opacity-75">{count ?? 0}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function FileLinkCard({ fileLink }) {
  return (
    <article className="rounded-block border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={fileLink.typeMeta} />
            <StatusBadge meta={fileLink.statusMeta} />
          </div>
          <h3 className="mt-3 text-ui text-text-primary">{fileLink.title}</h3>
          {fileLink.description ? (
            <p className="mt-2 line-clamp-3 text-body text-text-secondary">{fileLink.description}</p>
          ) : null}
        </div>
        {fileLink.url ? (
          <Button asChild className="shrink-0" size="sm" variant="outline">
            <a href={fileLink.url} rel="noreferrer" target="_blank">
              Open
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-label font-normal text-text-muted">
        {fileLink.projectName ? <span>{fileLink.projectName}</span> : null}
        {fileLink.relatedReportTitle ? <span>{fileLink.relatedReportTitle}</span> : null}
        {fileLink.fileName ? <span>{fileLink.fileName}</span> : null}
        {fileLink.uploadedByName ? <span>By {fileLink.uploadedByName}</span> : null}
        <span>Updated {formatDate(fileLink.updatedAt)}</span>
      </div>
    </article>
  )
}

export function FilesLinksSummary({ counts }) {
  return (
    <Panel>
      <PanelBody className="grid gap-4 p-5 sm:grid-cols-4">
        <div>
          <p className="text-label text-text-muted">All resources</p>
          <p className="mt-1 text-data text-text-primary">{counts.all}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Deliverables</p>
          <p className="mt-1 text-data text-text-primary">{counts.deliverables}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Reports</p>
          <p className="mt-1 text-data text-text-primary">{counts.reports}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">Shared links</p>
          <p className="mt-1 text-data text-text-primary">{counts.sharedLinks}</p>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function FilesLinksLibrary({ counts, fileLinks }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredFileLinks = useMemo(() => (
    activeFilter === 'all'
      ? fileLinks
      : fileLinks.filter((fileLink) => fileLink.type === activeFilter)
  ), [activeFilter, fileLinks])

  return (
    <Panel>
      <PanelHeader
        subtitle="Published deliverables, client uploads, reports, brand assets, shared links, and admin files."
        title="Files & Links"
      />
      <PanelBody className="grid gap-4">
        <FileLinkFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        {filteredFileLinks.length ? (
          <div className="grid gap-3">
            {filteredFileLinks.map((fileLink) => (
              <FileLinkCard fileLink={fileLink} key={fileLink.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="No published client resources match this view."
            iconName="fileText"
            title="No resources here"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
