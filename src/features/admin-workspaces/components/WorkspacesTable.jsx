import { Link } from 'react-router-dom'
import { useMemo } from 'react'

import { ROUTE_PATHS } from '@/domain/navigation/routePaths'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { WORKSPACE_STATUS_META } from '@/entities/workspace'
import {
  Button,
  DataTable,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

export function WorkspacesTable({
  error,
  selectedClient,
  status,
  workspaces,
}) {
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
    {
      cell: ({ row }) => (
        <Button asChild size="sm" variant="outline">
          <Link to={getDefaultWorkspaceAdminPath(row.original)}>Open</Link>
        </Button>
      ),
      enableSorting: false,
      header: 'Actions',
      id: 'actions',
      meta: {
        isAction: true,
        label: 'Actions',
        nowrap: true,
      },
    },
  ], [])

  return (
    <Panel>
      <PanelHeader
        action={selectedClient ? (
          <Button asChild size="sm" variant="ghost">
            <Link to={ROUTE_PATHS.agencyWorkspaces}>Show all</Link>
          </Button>
        ) : null}
        divided
        title={selectedClient ? `${selectedClient.name} workspaces` : 'Workspaces'}
      />
      <PanelBody className="overflow-x-auto p-0">
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
      </PanelBody>
    </Panel>
  )
}
