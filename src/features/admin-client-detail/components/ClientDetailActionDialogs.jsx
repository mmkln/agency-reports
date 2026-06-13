import { WORKSPACE_ROLE_META, WORKSPACE_ROLES } from '@/entities/workspace-membership'
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
import { EMAIL_VALIDATION_ERROR, getEmailValidationIssue } from '@/shared/validation/email'

const CLIENT_SAFE_WORKSPACE_ROLE_OPTIONS = [
  WORKSPACE_ROLES.VIEWER,
  WORKSPACE_ROLES.CLINIC_OWNER,
  WORKSPACE_ROLES.PRACTICE_MANAGER,
  WORKSPACE_ROLES.DOCTOR_REVIEWER,
]
function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive" role="alert">{children}</p>
}

function getInviteEmailIssue({ email, error }) {
  if (email) {
    return getEmailValidationIssue(email)
  }

  return error === EMAIL_VALIDATION_ERROR ? error : ''
}

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
  const emailIssue = getInviteEmailIssue({ email: form.email, error })
  const formError = emailIssue === error ? '' : error

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
            <span className="text-label text-text-secondary">Name</span>
            <Input
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              placeholder="Sarah Johnson"
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(emailIssue)}
              autoFocus
              onChange={(event) => onUpdateForm({ email: event.target.value })}
              placeholder="owner@example.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{emailIssue}</FieldError>
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Role</span>
            <Select onChange={(event) => onUpdateForm({ role: event.target.value })} value={form.role}>
              {CLIENT_SAFE_WORKSPACE_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{WORKSPACE_ROLE_META[role]?.label ?? role}</option>
              ))}
            </Select>
          </label>
          {formError ? (
            <ErrorBlock title="Client user could not be invited">
              {formError}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'inviting'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || Boolean(emailIssue) || status === 'inviting'} form="invite-client-detail-user-form" type="submit">
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
