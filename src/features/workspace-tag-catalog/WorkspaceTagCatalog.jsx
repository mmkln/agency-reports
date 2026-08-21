import { useMemo } from 'react'

import {
  formatSourceTagConnection,
  formatSourceTagSyncDate,
} from '@/entities/source-tag'
import { Icon } from '@/shared/icons'
import {
  ContentToolbar,
  DataTable,
  DataTableSurface,
  IconButton,
  ResourceState,
  SearchField,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui'

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
    return <span className="text-text-muted">Not used in reviews</span>
  }

  return (
    <div className="grid gap-micro">
      {usages.map((usage) => (
        <span key={usage.signalId}>
          {usage.campaignName} · {usage.signalLabel}
        </span>
      ))}
    </div>
  )
}

export function WorkspaceTagCatalog({ apiClient, workspaceId }) {
  const workflow = useWorkspaceTagCatalog({ apiClient, workspaceId })
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="grid gap-micro">
          <span className="font-medium text-text-primary">{row.original.name}</span>
          <span className="text-label text-text-muted">{row.original.externalId}</span>
        </div>
      ),
      header: 'Tag',
      meta: { minWidthClassName: 'min-w-title' },
    },
    {
      accessorFn: (tag) => tag.usages.map((usage) => usage.campaignName).join(' '),
      cell: ({ row }) => <TagUsageCell usages={row.original.usages} />,
      header: 'Used in reviews',
      id: 'usages',
      meta: { minWidthClassName: 'min-w-title' },
    },
    {
      accessorFn: (tag) => formatSourceTagConnection(tag.sourceConnection),
      cell: ({ row }) => formatSourceTagConnection(row.original.sourceConnection),
      header: 'Source',
      id: 'source',
      meta: { nowrap: true },
    },
    {
      accessorKey: 'updatedAt',
      cell: ({ row }) => formatSourceTagSyncDate(row.original.updatedAt),
      header: 'Last synced',
      meta: { nowrap: true },
    },
  ], [])

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
    </div>
  )
}
