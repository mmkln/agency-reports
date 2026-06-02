import { Link } from 'react-router-dom'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

import { getWorkspaceAdminPath } from '../model/adminClientPaths'

export function ClientDetailDialog({
  client,
  isOpen,
  onClose,
  onEditClient,
  onInviteClientUser,
  permissions,
}) {
  const workspaces = client?.workspaces ?? []

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-lg">
        <DialogHeader>
          <DialogTitle>{client?.name ?? 'Client'}</DialogTitle>
          <DialogDescription>
            Client account, workspaces, and access summary.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-component">
          <dl className="grid gap-item rounded-control bg-block-subtle px-control py-control text-ui">
            <div className="flex items-center justify-between gap-component">
              <dt className="text-text-secondary">Status</dt>
              <dd className="font-medium text-text-primary">{client?.status ?? 'active'}</dd>
            </div>
            <div className="flex items-center justify-between gap-component">
              <dt className="text-text-secondary">Workspaces</dt>
              <dd className="font-medium text-text-primary">{client?.workspaceCount ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between gap-component">
              <dt className="text-text-secondary">Client users</dt>
              <dd className="font-medium text-text-primary">{client?.membershipCount ?? 0}</dd>
            </div>
          </dl>
          <div className="grid gap-item">
            <p className="text-label text-text-secondary">Workspaces</p>
            <div className="grid gap-item">
              {workspaces.map((workspace) => (
                <Button asChild key={workspace.id} size="sm" variant="outline">
                  <Link to={getWorkspaceAdminPath(workspace, client)}>{workspace.name}</Link>
                </Button>
              ))}
              {workspaces.length === 0 ? (
                <p className="rounded-control bg-block-subtle px-control py-control text-ui text-text-muted">
                  No workspaces attached yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          {permissions?.canInviteClientUser ? (
            <Button onClick={() => onInviteClientUser(client)} type="button" variant="ghost">
              Invite user
            </Button>
          ) : null}
          {permissions?.canEditClient ? (
            <Button onClick={() => onEditClient(client)} type="button">
              Edit client
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
