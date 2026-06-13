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
]
const EMAIL_REQUIRED_ERROR = 'Email is required.'
const NAME_REQUIRED_ERROR = 'Name is required.'

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive" role="alert">{children}</p>
}

function getInviteNameIssue({ error }) {
  return error === NAME_REQUIRED_ERROR ? error : ''
}

function getInviteEmailIssue({ email, error }) {
  if (email) {
    return getEmailValidationIssue(email)
  }

  return error === EMAIL_REQUIRED_ERROR || error === EMAIL_VALIDATION_ERROR ? error : ''
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
  const nameIssue = getInviteNameIssue({ error })
  const emailIssue = getInviteEmailIssue({ email: form.email, error })
  const formError = nameIssue === error || emailIssue === error ? '' : error

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
        <form className="grid gap-component" id="invite-client-user-form" noValidate onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Name</span>
            <Input
              aria-invalid={Boolean(nameIssue)}
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              placeholder="Sarah Johnson"
              required
              value={form.name}
            />
            <FieldError>{nameIssue}</FieldError>
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
          <Button disabled={!client || Boolean(emailIssue) || status === 'inviting'} form="invite-client-user-form" type="submit">
            {status === 'inviting' ? 'Inviting...' : 'Invite user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
