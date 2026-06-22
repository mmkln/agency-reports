import { Link } from 'react-router-dom'
import { useMemo } from 'react'

import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { WORKSPACE_STATUS_META } from '@/entities/workspace'
import {
  DataTable,
  DataTableSurface,
  ErrorBlock,
  StatusBadge,
} from '@/shared/ui'

export function WorkspacesTable({
  error,
  status,
  workspaces,
}) {
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => (
        <Link
          className="rounded-sm font-medium text-text-primary no-underline transition-colors duration-motion-fast ease-motion-standard hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          to={getDefaultWorkspaceAdminPath(row.original)}
        >
          {row.original.name}
        </Link>
      ),
      header: 'Name',
    },
    {
      accessorKey: 'client_name',
      cell: ({ row }) => row.original.client_name || 'Unassigned',
      header: 'Client',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge
          meta={WORKSPACE_STATUS_META[row.original.status] ?? {
            label: row.original.status || 'Unknown',
            tone: 'neutral',
          }}
        />
      ),
      header: 'Status',
    },
  ], [])

  return (
    <DataTableSurface>
      {status === 'loading' ? (
        <div className="min-h-[220px] animate-pulse" />
      ) : status === 'error' ? (
        <div className="p-card">
          <ErrorBlock title="Workspaces could not be loaded">
            {error}
          </ErrorBlock>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={workspaces}
          emptyMessage="No workspaces yet."
          getRowId={(workspace) => workspace.id}
        />
      )}
    </DataTableSurface>
  )
}
