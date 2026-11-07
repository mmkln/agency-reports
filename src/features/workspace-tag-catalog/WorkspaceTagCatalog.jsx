import { useMemo } from 'react'

import {
  formatSourceTagConnection,
  formatSourceTagSyncDate,
} from '@/entities/source-tag'
import { Icon } from '@/shared/icons'
import {
  Button,
  ContentToolbar,
  DataTable,
  DataTableSurface,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ResourceState,
  SearchField,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui'

import { TagDescriptionDialog } from './TagDescriptionDialog'
import { useWorkspaceTagCatalog } from './useWorkspaceTagCatalog'

function TagCatalogLoadingState() {
  return (
    <DataTableSurface className="grid gap-component p-component">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-control-small w-full" key={index} />
      ))}
    </DataTableSurface>
  )
}

function TagUsageCell({ usages }) {
  if (usages.length === 0) {
    return <span aria-label="Not mapped" className="text-text-muted">—</span>
  }

  const [primaryUsage, ...remainingUsages] = usages

  return (
    <div className="grid justify-items-start gap-micro">
      <span>{primaryUsage.campaignName} · {primaryUsage.signalLabel}</span>
      {remainingUsages.length ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost">
              +{remainingUsages.length} more
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <div className="grid gap-control">
              <p className="text-label font-medium text-text-primary">Review usage</p>
              <ul className="grid gap-item">
                {usages.map((usage) => (
                  <li className="grid gap-micro" key={usage.signalId}>
                    <span className="text-ui font-medium text-text-primary">
                      {usage.campaignName}
                    </span>
                    <span className="text-label text-text-muted">{usage.signalLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

function TagDescriptionCell({ onEdit, tag }) {
  if (!tag.description) {
    return (
      <Button onClick={() => onEdit(tag.id)} size="sm" variant="ghost">
        Add description
      </Button>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-item">
      <span className="line-clamp-1 min-w-0 flex-1 text-text-secondary">
        {tag.description}
      </span>
      <IconButton
        aria-label={`Edit ${tag.name} description`}
        onClick={() => onEdit(tag.id)}
        size="sm"
        variant="ghost"
      >
        <Icon name="pencil" size={15} />
      </IconButton>
    </div>
  )
}

export function WorkspaceTagCatalog({ apiClient, workspaceId }) {
  const workflow = useWorkspaceTagCatalog({ apiClient, workspaceId })
  const { openDescriptionEditor, showSourceColumn } = workflow
  const columns = useMemo(() => {
    const catalogColumns = [{
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.name}</span>,
      header: 'Tag',
      meta: { minWidthClassName: 'min-w-title' },
    }, {
      accessorKey: 'description',
      cell: ({ row }) => (
        <TagDescriptionCell
          onEdit={openDescriptionEditor}
          tag={row.original}
        />
      ),
      header: 'Description',
      meta: { minWidthClassName: 'min-w-title' },
    }, {
      accessorFn: (tag) => tag.usages.map((usage) => usage.campaignName).join(' '),
      cell: ({ row }) => <TagUsageCell usages={row.original.usages} />,
      header: 'Review usage',
      id: 'usages',
      meta: { minWidthClassName: 'min-w-title' },
    }]

    if (showSourceColumn) {
      catalogColumns.push({
        accessorFn: (tag) => formatSourceTagConnection(tag.sourceConnection),
        cell: ({ row }) => formatSourceTagConnection(row.original.sourceConnection),
        header: 'Source',
        id: 'source',
        meta: { nowrap: true },
      })
    }

    return catalogColumns
  }, [openDescriptionEditor, showSourceColumn])

  if (workflow.resource.status === 'loading') {
    return <TagCatalogLoadingState />
  }

  if (workflow.resource.status === 'error') {
    return (
      <ResourceState
        errorInfo={workflow.resource.errorInfo}
        labels={{
          failureDescription: 'Tag data could not be loaded from the backend.',
          failureTitle: 'Tag catalog is unavailable',
          networkDescription: 'Check the backend connection and try again.',
          networkTitle: 'Tag catalog is unavailable',
          permissionDescription: 'Ask an admin to update your integration permissions.',
          permissionTitle: 'You do not have access to the tag catalog',
        }}
        onRetry={workflow.resource.reload}
      />
    )
  }

  return (
    <div className="grid gap-component">
      <ContentToolbar className="sm:flex-row sm:items-center">
        <SearchField
          className="sm:max-w-search"
          label="Search tags"
          onValueChange={workflow.setQuery}
          placeholder="Search tags"
          value={workflow.query}
        />
        <div className="flex flex-wrap items-center gap-control sm:ml-auto">
          {workflow.catalogUpdatedAt ? (
            <span className="text-label text-text-muted">
              Updated {formatSourceTagSyncDate(workflow.catalogUpdatedAt)}
            </span>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                aria-label="Refresh tags from GHL"
                disabled={!workflow.hasSourceConnections || workflow.refreshStatus === 'refreshing'}
                onClick={workflow.refreshTags}
                size="sm"
                variant="outline"
              >
                <Icon
                  className={workflow.refreshStatus === 'refreshing' ? 'animate-spin' : ''}
                  name="refreshCw"
                  size={15}
                />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>
              {workflow.hasSourceConnections ? 'Refresh tags from GHL' : 'Connect an active GHL source first'}
            </TooltipContent>
          </Tooltip>
        </div>
      </ContentToolbar>

      <DataTableSurface>
        <DataTable
          columns={columns}
          data={workflow.filteredTags}
          emptyMessage={workflow.tagCount === 0
            ? 'No tags have been synced for this workspace.'
            : 'No tags match your search.'}
          getRowId={(tag) => tag.id}
          pageSize={20}
        />
      </DataTableSurface>
      <TagDescriptionDialog
        draft={workflow.descriptionDraft}
        error={workflow.descriptionSaveError}
        onChange={workflow.setDescriptionDraft}
        onClose={workflow.closeDescriptionEditor}
        onSave={workflow.saveDescription}
        saveStatus={workflow.descriptionSaveStatus}
        tag={workflow.descriptionEditorTag}
      />
    </div>
  )
}
