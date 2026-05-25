import {
  Button,
  Input,
} from '@/shared/ui'

import { WorkspaceMembershipRoleSelect } from '../../../entities/workspace-membership/ui'
import { FieldError } from '../../admin-client-workspace'

export function AccessMemberForm({
  canSubmit = true,
  error,
  form,
  memberEmailIssue,
  memberNameIssue,
  onCancel,
  onSubmit,
  onUpdateForm,
}) {
  return (
    <form className="grid grid-cols-1 gap-component" noValidate onSubmit={onSubmit}>
      <div className="grid gap-control sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Name</span>
          <Input
            aria-invalid={Boolean(memberNameIssue)}
            minLength={2}
            onChange={(event) => onUpdateForm('name', event.target.value)}
            placeholder="Sarah Johnson"
            required
            value={form.name}
          />
          <FieldError>{memberNameIssue}</FieldError>
        </label>
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Email</span>
          <Input
            aria-invalid={Boolean(memberEmailIssue)}
            inputMode="email"
            onChange={(event) => onUpdateForm('email', event.target.value)}
            placeholder="sarah@client.com"
            required
            type="email"
            value={form.email}
          />
          <FieldError>{memberEmailIssue}</FieldError>
        </label>
      </div>
      <div className="grid gap-control sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Role</span>
          <WorkspaceMembershipRoleSelect
            className="bg-block"
            onValueChange={(role) => onUpdateForm('role', role)}
            value={form.role}
          />
        </label>
      </div>
      <FieldError>{error}</FieldError>
      <div className="flex justify-end gap-control">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={!canSubmit} type="submit">
          Add client user
        </Button>
      </div>
    </form>
  )
}
