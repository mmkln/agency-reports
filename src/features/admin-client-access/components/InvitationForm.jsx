import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from '@/shared/ui'

import { WORKSPACE_ROLE_META, WORKSPACE_ROLES } from '../../../entities/workspace-membership'
import { FieldError } from '../../admin-client-workspace'

const CLIENT_SAFE_WORKSPACE_ROLES = [
  WORKSPACE_ROLES.VIEWER,
  WORKSPACE_ROLES.CLINIC_OWNER,
]

export function InvitationDialog({
  error,
  form,
  invitationEmailIssue,
  invitationNameIssue,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
  const formError = error === invitationNameIssue || error === invitationEmailIssue ? '' : error

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
        <form className="grid gap-component" id="invite-workspace-user-form" noValidate onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Name</span>
            <Input
              aria-invalid={Boolean(invitationNameIssue)}
              onChange={(event) => onUpdateForm('name', event.target.value)}
              placeholder="Sarah Johnson"
              required
              value={form.name}
            />
            <FieldError>{invitationNameIssue}</FieldError>
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(invitationEmailIssue)}
              autoFocus
              onChange={(event) => onUpdateForm('email', event.target.value)}
              placeholder="owner@example.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{invitationEmailIssue}</FieldError>
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Role</span>
            <Select onChange={(event) => onUpdateForm('role', event.target.value)} value={form.role}>
              {CLIENT_SAFE_WORKSPACE_ROLES.map((role) => (
                <option key={role} value={role}>{WORKSPACE_ROLE_META[role]?.label ?? role}</option>
              ))}
            </Select>
          </label>
          {formError ? (
            <FieldError>{formError}</FieldError>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'inviting'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            disabled={Boolean(invitationEmailIssue) || status === 'inviting'}
            form="invite-workspace-user-form"
            type="submit"
          >
            {status === 'inviting' ? 'Inviting...' : 'Invite user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
