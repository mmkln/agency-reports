import { CLIENT_ROLE_META, CLIENT_ROLES } from '@/entities/client-membership'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
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

export function ClientInviteUserDialog({
  client,
  error,
  form,
  isOpen,
  memberships,
  membershipsStatus,
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
          <DialogDescription>
            Add an existing user to the client account. Workspace-specific access remains managed on workspace access pages.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-component" id="invite-client-user-form" onSubmit={onSubmit}>
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
          <div className="rounded-control bg-block-subtle px-control py-control text-ui text-text-secondary">
            {membershipsStatus === 'loading'
              ? 'Loading current client users...'
              : `${memberships.length} client user${memberships.length === 1 ? '' : 's'} currently attached${client ? ` to ${client.name}` : ''}.`}
          </div>
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
          <Button disabled={!client || status === 'inviting'} form="invite-client-user-form" type="submit">
            {status === 'inviting' ? 'Inviting...' : 'Invite user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
