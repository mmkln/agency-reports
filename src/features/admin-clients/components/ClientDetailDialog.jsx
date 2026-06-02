import { Link } from 'react-router-dom'

import {
  Button,
  Dialog,
  DialogContent,
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
        </DialogHeader>
        <div className="grid gap-component">
          <p className="text-ui text-text-secondary">{client?.status ?? 'active'}</p>
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
