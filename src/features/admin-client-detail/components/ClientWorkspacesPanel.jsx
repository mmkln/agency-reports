import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { WORKSPACE_TYPE_META } from '@/entities/workspace'
import { getDefaultWorkspaceAdminPath } from '@/features/admin-client-workspace'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  DataTable,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { getWorkspaceStatusMeta } from '../model/clientDetailPresentation'

export function ClientWorkspacesPanel({ workspaces }) {
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      header: 'Name',
    },
    {
      accessorKey: 'type',
      cell: ({ row }) => {
        const typeMeta = WORKSPACE_TYPE_META[row.original.type]

        return (
          <Badge tone={typeMeta?.tone ?? 'neutral'}>
            {typeMeta?.label ?? row.original.type}
          </Badge>
        )
      },
      header: 'Type',
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge meta={getWorkspaceStatusMeta(row.original)} />,
      header: 'Status',
    },
    {
      cell: ({ row }) => (
        <Button asChild size="sm" variant="outline">
          <Link to={getDefaultWorkspaceAdminPath(row.original)}>
            <Icon name="arrowUpRight" size={16} />
            Open workspace
          </Link>
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
      <PanelHeader divided iconName="grid" title="Workspaces" />
      <PanelBody className="p-0">
        <DataTable
          columns={columns}
          data={workspaces}
          emptyMessage="No workspaces yet. Add a workspace to start organizing this client."
          getRowId={(workspace) => workspace.id}
        />
      </PanelBody>
    </Panel>
  )
}
