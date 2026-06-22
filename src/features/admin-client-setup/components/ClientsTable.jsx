import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getAgencyWorkspaceAccessPath,
  getAgencyWorkspaceReviewPath,
  getAgencyWorkspaceSetupPath,
} from '@/domain/navigation/routePaths'
import {
  Button,
  ConfirmationDialog,
  DataTable,
  DataTableSurface,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { ClientAvatar } from './ClientAvatar'
import { ClientStatusBadge } from './ClientStatusBadge'

function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function ClientCell({ client }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ClientAvatar client={client} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-text-primary">{client.name}</p>
        <p className="mt-1 flex items-center gap-1 text-label font-normal text-text-muted">
          <Icon name="arrowUpRight" size={13} />
          <span className="truncate">/{client.portal_slug}</span>
        </p>
      </div>
    </div>
  )
}

function PrimaryContactCell({ client }) {
  return (
    <div>
      <p className="font-medium text-text-secondary">{client.primary_contact_name}</p>
      <p className="mt-0.5 text-label font-normal text-text-muted">{client.primary_contact_email}</p>
    </div>
  )
}

function ClientActions({
  client,
  onDelete,
  onEditClient,
  pendingInvite,
}) {
  return (
    <div className="flex justify-end gap-1.5">
      <Button asChild size="sm" variant="outline">
        <Link to={getAgencyWorkspaceSetupPath(client.id)}>
          Open
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label={`${client.name} actions`} size="icon-sm" type="button" variant="ghost">
            <Icon name="ellipsis" size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem onClick={() => onEditClient(client)}>
            <Icon name="wrench" size={15} />
            Edit client
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={getAgencyWorkspaceReviewPath(client.id)}>
              <Icon name="arrowUpRight" size={15} />
              Preview Growth Review
            </Link>
          </DropdownMenuItem>
          {pendingInvite ? (
            <DropdownMenuItem asChild>
              <Link to={`/accept-invite?token=${pendingInvite.token}`}>
                <Icon name="mail" size={15} />
                Open pending invitation
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link to={getAgencyWorkspaceAccessPath(client.id)}>
              <Icon name="users" size={15} />
              Access
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(client)}
            variant="destructive"
          >
            <Icon name="close" size={15} />
            Delete client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ClientsTable({
  clients,
  onDeleteClient,
  onEditClient,
  pendingInvitationsByClientId = {},
}) {
  const [clientPendingDelete, setClientPendingDelete] = useState(null)
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      cell: ({ row }) => <ClientCell client={row.original} />,
      header: 'Client',
      meta: {
        label: 'Client',
        minWidthClassName: 'min-w-[280px]',
      },
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => <ClientStatusBadge status={row.original.status} />,
      header: 'Project Status',
    },
    {
      accessorKey: 'primary_contact_name',
      cell: ({ row }) => <PrimaryContactCell client={row.original} />,
      header: 'Primary Contact',
      sortingFn: (left, right) => (
        String(left.original.primary_contact_name ?? '').localeCompare(
          String(right.original.primary_contact_name ?? ''),
        )
      ),
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => formatDate(row.original.created_at),
      header: 'Created',
      meta: {
        cellClassName: 'text-text-muted',
      },
    },
    {
      cell: ({ row }) => (
        <ClientActions
          client={row.original}
          onDelete={setClientPendingDelete}
          onEditClient={onEditClient}
          pendingInvite={pendingInvitationsByClientId[row.original.id] ?? null}
        />
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
  ], [onEditClient, pendingInvitationsByClientId])

  function confirmDeleteClient() {
    if (!clientPendingDelete) {
      return
    }

    onDeleteClient(clientPendingDelete.id)
    setClientPendingDelete(null)
  }

  return (
    <>
      <DataTableSurface>
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="No clients yet."
          getRowId={(client) => client.id}
        />
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete client"
        description={
          clientPendingDelete
            ? `This removes ${clientPendingDelete.name} and its portal data. This action cannot be undone.`
            : ''
        }
        onConfirm={confirmDeleteClient}
        onOpenChange={(open) => {
          if (!open) {
            setClientPendingDelete(null)
          }
        }}
        open={Boolean(clientPendingDelete)}
        title="Delete client?"
        tone="destructive"
      />
    </>
  )
}
