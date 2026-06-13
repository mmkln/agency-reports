import { CLIENT_ROLE_META, CLIENT_ROLES } from '@/entities/client-membership'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
  Select,
} from '@/shared/ui'

const CLIENT_ROLE_OPTIONS = [
  CLIENT_ROLES.OWNER,
  CLIENT_ROLES.ADMIN,
  CLIENT_ROLES.TEAM,
]

export function ClientQuickEditDialog({
  client,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
        </DialogHeader>
        <form className="grid gap-component" id="edit-client-detail-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Status</span>
            <Select onChange={(event) => onUpdateForm({ status: event.target.value })} value={form.status}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Client could not be updated">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'saving'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || status === 'saving'} form="edit-client-detail-form" type="submit">
            {status === 'saving' ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ClientInviteUserDialog({
  client,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Invite client user</DialogTitle>
        </DialogHeader>
        <form className="grid gap-component" id="invite-client-detail-user-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Email</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ email: event.target.value })}
              placeholder="owner@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Role</span>
            <Select onChange={(event) => onUpdateForm({ role: event.target.value })} value={form.role}>
              {CLIENT_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{CLIENT_ROLE_META[role]?.label ?? role}</option>
              ))}
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Client user could not be invited">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'inviting'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || status === 'inviting'} form="invite-client-detail-user-form" type="submit">
            {status === 'inviting' ? 'Inviting...' : 'Invite user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ClientWorkspaceCreateDialog({
  client,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>
        <form className="grid gap-component" id="create-client-detail-workspace-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client</span>
            <Input disabled value={client?.name ?? ''} />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Workspace name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              placeholder="Main clinic"
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Type</span>
            <Select onChange={(event) => onUpdateForm({ type: event.target.value })} value={form.type}>
              <option value="clinic">Clinic</option>
              <option value="generic">Generic</option>
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Workspace could not be created">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || status === 'creating'} form="create-client-detail-workspace-form" type="submit">
            {status === 'creating' ? 'Creating...' : 'Create workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
