import {
  DataTableSurface,
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { getClientActionPermissions } from '../model/clientActionPermissions'
import { ClientMoreMenu } from './ClientMoreMenu'
import { ClientWorkspaceAction } from './ClientWorkspaceAction'

export function ClientsTable({
  clients,
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
            <TableHead>Workspaces</TableHead>
            <TableActionHead>Actions</TableActionHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const permissions = getClientActionPermissions(viewer, client)

            return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.status}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-item">
                    <ClientWorkspaceAction client={client} permissions={permissions} />
                    <span className="text-label text-text-muted">{client.workspaceCount}</span>
                  </div>
                </TableCell>
                <TableActionCell>
                  <ClientMoreMenu
                    client={client}
                    onEditClient={onEditClient}
                    onInviteClientUser={onInviteClientUser}
                    onOpenClient={onOpenClient}
                    permissions={permissions}
                  />
                </TableActionCell>
              </TableRow>
            )
          })}
          {clients.length === 0 ? (
            <TableRow>
              <TableCell className="text-text-muted" colSpan={4}>
                No clients yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </DataTableSurface>
  )
}
