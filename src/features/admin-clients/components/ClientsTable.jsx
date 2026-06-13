import {
  DataTableSurface,
  StatusBadge,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  return (
    <DataTableSurface>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableActionHead>Actions</TableActionHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const permissions = getClientActionPermissions(viewer, client)

            return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    meta={CLIENT_STATUS_META[client.status] ?? {
                      label: client.status || 'Unknown',
                      tone: 'neutral',
                    }}
                  />
                </TableCell>
                <TableActionCell>
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
                </TableActionCell>
              </TableRow>
            )
          })}
          {clients.length === 0 ? (
            <TableRow>
              <TableCell className="text-text-muted" colSpan={3}>
                No clients yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </DataTableSurface>
  )
}
