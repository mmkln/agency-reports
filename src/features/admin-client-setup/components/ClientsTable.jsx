import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  PrimitiveCard as Card,
  Table,
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

function getPendingInvite(client, repositories) {
  return repositories.clientInvitations
    .listByClientId(client.id)
    .find((invitation) => invitation.status === 'pending')
}

export function ClientsTable({ clients, onDeleteClient, onEditClient, repositories }) {
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
      <Card className="border-control-border bg-block py-0 shadow-none">
        <Table className="min-w-[980px]">
          <TableHeader className="border-b border-control-border bg-surface-subtle text-xs font-semibold tracking-wide text-text-muted uppercase">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-3">Client</TableHead>
              <TableHead className="px-6 py-3">Project Status</TableHead>
              <TableHead className="px-6 py-3">Primary Contact</TableHead>
              <TableHead className="px-6 py-3">Created</TableHead>
              <TableHead className="px-6 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-separator">
            {clients.map((client) => (
              <TableRow className="transition-colors hover:bg-block-subtle" key={client.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <ClientAvatar client={client} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{client.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                        <Icon name="arrowUpRight" size={13} />
                        <span className="truncate">/{client.portal_slug}</span>
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <ClientStatusBadge status={client.status} />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <p className="font-medium text-text-secondary">{client.primary_contact_name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{client.primary_contact_email}</p>
                </TableCell>
                <TableCell className="px-6 py-4 text-text-muted">{formatDate(client.created_at)}</TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {getPendingInvite(client, repositories) ? (
                      <Button asChild size="icon-sm" title="Open pending invitation" variant="ghost">
                        <Link to={`/accept-invite?token=${getPendingInvite(client, repositories).token}`}>
                          <Icon name="mail" size={16} />
                        </Link>
                      </Button>
                    ) : null}
                    <Button onClick={() => onEditClient(client)} size="sm" type="button" variant="ghost">
                      Edit Client
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/client-overview?clientId=${client.id}`}>
                        Edit Overview
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/admin/client-preview?clientId=${client.id}`}>
                        Preview
                        <Icon name="arrowUpRight" size={14} />
                      </Link>
                    </Button>
                    <Button
                      className="text-text-quaternary hover:text-destructive"
                      onClick={() => setClientPendingDelete(client)}
                      size="icon-sm"
                      title="Delete client"
                      type="button"
                      variant="ghost"
                    >
                      <Icon name="close" size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
