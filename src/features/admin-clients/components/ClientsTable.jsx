import { useMemo } from 'react'

import {
  DataTable,
  DataTableSurface,
  StatusBadge,
} from '@/shared/ui'
import { CLIENT_STATUS_META } from '@/entities/client'

import { getClientActionPermissions } from '../model/clientActionPermissions'
import { ClientMoreMenu } from './ClientMoreMenu'
import { ClientWorkspaceAction } from './ClientWorkspaceAction'

export function ClientsTable({
  clients,
  onCreateWorkspace,
  onEditClient,
  onInviteClientUser,
  onOpenClient,
  viewer,
}) {
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      header: 'Name',
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge
          meta={CLIENT_STATUS_META[row.original.status] ?? {
            label: row.original.status || 'Unknown',
            tone: 'neutral',
          }}
        />
      ),
      header: 'Status',
    },
    {
      cell: ({ row }) => {
        const client = row.original
        const permissions = getClientActionPermissions(viewer, client)

        return (
          <div className="flex justify-end gap-item">
            <ClientWorkspaceAction
              client={client}
              onCreateWorkspace={onCreateWorkspace}
              permissions={permissions}
            />
            <ClientMoreMenu
              client={client}
              onCreateWorkspace={onCreateWorkspace}
              onEditClient={onEditClient}
              onInviteClientUser={onInviteClientUser}
              onOpenClient={onOpenClient}
              permissions={permissions}
            />
          </div>
        )
      },
      enableSorting: false,
      header: 'Actions',
      id: 'actions',
      meta: {
        isAction: true,
        label: 'Actions',
        nowrap: true,
      },
    },
  ], [onCreateWorkspace, onEditClient, onInviteClientUser, onOpenClient, viewer])

  return (
    <DataTableSurface>
      <DataTable
        columns={columns}
        data={clients}
        emptyMessage="No clients yet."
        getRowId={(client) => client.id}
      />
    </DataTableSurface>
  )
}
