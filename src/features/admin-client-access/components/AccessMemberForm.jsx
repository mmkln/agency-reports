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
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_132px_auto] xl:items-start">
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
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Role</span>
          <Select onValueChange={(role) => onUpdateForm('role', role)} value={form.role}>
            <SelectTrigger className="bg-block">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button className="xl:mt-[22px]" disabled={Boolean(memberNameIssue || memberEmailIssue)} type="submit">
          Add member
        </Button>
      </div>
      <FieldError>{error}</FieldError>
    </form>
  )
}
