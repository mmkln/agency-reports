import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  DataTableSurface,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

export function ClientsTable({
  clients,
  onDeleteClient,
  onEditClient,
  pendingInvitationsByClientId = {},
}) {
  const [clientPendingDelete, setClientPendingDelete] = useState(null)

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
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Project Status</TableHead>
              <TableHead>Primary Contact</TableHead>
              <TableHead>Created</TableHead>
              <TableActionHead>Actions</TableActionHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const pendingInvite = pendingInvitationsByClientId[client.id] ?? null

              return (
                <TableRow key={client.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-secondary">{client.primary_contact_name}</p>
                    <p className="mt-0.5 text-label font-normal text-text-muted">{client.primary_contact_email}</p>
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDate(client.created_at)}</TableCell>
                  <TableActionCell>
                    <div className="flex justify-end gap-1.5">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/clinic-setup?clientId=${client.id}`}>
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
                            <Link to={`/client/growth-review?clientId=${client.id}`}>
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
                            <Link to={`/admin/client-access?clientId=${client.id}`}>
                              <Icon name="users" size={15} />
                              Access
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setClientPendingDelete(client)}
                            variant="destructive"
                          >
                            <Icon name="close" size={15} />
                            Delete client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableActionCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DataTableSurface>

      <ConfirmationDialog
        confirmLabel="Delete client"
        description={
          clientPendingDelete
            ? `This removes ${clientPendingDelete.name} and its local demo portal data. This action cannot be undone.`
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
