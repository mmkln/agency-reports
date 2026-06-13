import {
  Button,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { WORKSPACE_ROLE_META, WORKSPACE_ROLES } from '../../../entities/workspace-membership'
import { FieldError } from '../../admin-client-workspace'

const CLIENT_SAFE_WORKSPACE_ROLES = [
  WORKSPACE_ROLES.VIEWER,
  WORKSPACE_ROLES.CLINIC_OWNER,
]

export function InvitationForm({
  error,
  form,
  invitationEmailIssue,
  invitationNameIssue,
  onSubmit,
  onUpdateForm,
}) {
  const formError = error === invitationNameIssue || error === invitationEmailIssue ? '' : error

  return (
    <form className="grid grid-cols-1 gap-3 border-t border-separator pt-4" noValidate onSubmit={onSubmit}>
      <p className="text-label text-text-secondary">Invite workspace user</p>
      <label className="grid gap-1.5">
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
      <label className="grid gap-1.5">
        <span className="text-label text-text-secondary">Email</span>
        <Input
          aria-invalid={Boolean(invitationEmailIssue)}
          inputMode="email"
          onChange={(event) => onUpdateForm('email', event.target.value)}
          placeholder="sarah@client.com"
          required
          type="email"
          value={form.email}
        />
        <FieldError>{invitationEmailIssue}</FieldError>
      </label>
      <label className="grid gap-1.5">
        <span className="text-label text-text-secondary">Role</span>
        <Select onValueChange={(role) => onUpdateForm('role', role)} value={form.role}>
          <SelectTrigger className="bg-block">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {CLIENT_SAFE_WORKSPACE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>{WORKSPACE_ROLE_META[role]?.label ?? role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <Button disabled={Boolean(invitationEmailIssue)} type="submit">Send invite</Button>
      <FieldError>{formError}</FieldError>
    </form>
  )
}
