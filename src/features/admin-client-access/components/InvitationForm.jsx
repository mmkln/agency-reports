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

export function InvitationForm({
  error,
  form,
  invitationEmailIssue,
  onSubmit,
  onUpdateForm,
}) {
  return (
    <form className="grid grid-cols-1 gap-3 border-t border-separator pt-4" noValidate onSubmit={onSubmit}>
      <p className="text-label text-text-secondary uppercase">Create invitation</p>
      <label className="grid gap-1.5">
        <span className="text-label text-text-secondary">Name</span>
        <Input
          onChange={(event) => onUpdateForm('name', event.target.value)}
          placeholder="Sarah Johnson"
          value={form.name}
        />
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
      <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
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
        <Input
          onChange={(event) => onUpdateForm('expiresAt', event.target.value)}
          type="date"
          value={form.expiresAt}
        />
      </div>
      <Button disabled={Boolean(invitationEmailIssue)} type="submit">Create invitation</Button>
      {error ? (
        <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}
