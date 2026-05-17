import {
  Button,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { FieldError } from '../../admin-client-workspace'

export function AccessMemberForm({
  error,
  form,
  memberEmailIssue,
  memberNameIssue,
  onSubmit,
  onUpdateForm,
}) {
  return (
    <form className="grid grid-cols-1 gap-3 border-t border-separator pt-4" noValidate onSubmit={onSubmit}>
      <p className="text-label text-text-secondary uppercase">Add client user</p>
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
      <div className="flex gap-2">
        <Select onValueChange={(role) => onUpdateForm('role', role)} value={form.role}>
          <SelectTrigger className="min-w-0 flex-1 bg-block">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={Boolean(memberNameIssue || memberEmailIssue)} type="submit">Add member</Button>
      </div>
      {error ? (
        <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}
