import { Button, Input } from '@/shared/ui'

import { INVITATION_ACCESS_LINK_SENT_MESSAGE } from '../../domain/services/clientInviteService'

export function RecoveryInviteForm({
  error,
  onSubmit,
  recoveryEmail,
  recoveryMessage,
  setError,
  setRecoveryEmail,
}) {
  return (
    <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
      <label className="grid gap-2">
        <span className="text-ui text-text-secondary">Email address</span>
        <Input
          autoComplete="email"
          name="email"
          onChange={(event) => {
            setRecoveryEmail(event.target.value)
            setError('')
          }}
          required
          type="email"
          value={recoveryEmail}
        />
      </label>
      <Button className="w-full" size="lg" type="submit">Send secure link</Button>
      {recoveryMessage ? (
        <p className="rounded-control bg-success-muted px-control py-item text-ui text-success-foreground">
          {INVITATION_ACCESS_LINK_SENT_MESSAGE}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-control bg-destructive/10 px-control py-item text-ui text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export function CreateInviteAccountForm({
  confirmPassword,
  email,
  name,
  onSubmit,
  password,
  setConfirmPassword,
  setError,
  setName,
  setPassword,
}) {
  return (
    <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
      <label className="grid gap-2">
        <span className="text-ui text-text-secondary">Name</span>
        <Input
          autoComplete="name"
          minLength={2}
          name="name"
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          required
          type="text"
          value={name}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-ui text-text-secondary">Email address</span>
        <Input autoComplete="email" name="email" readOnly required type="email" value={email} />
      </label>
      <label className="grid gap-2">
        <span className="text-ui text-text-secondary">Password</span>
        <Input
          autoComplete="new-password"
          minLength={8}
          name="password"
          onChange={(event) => {
            setPassword(event.target.value)
            setError('')
          }}
          required
          type="password"
          value={password}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-ui text-text-secondary">Confirm password</span>
        <Input
          autoComplete="new-password"
          minLength={8}
          name="confirmPassword"
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            setError('')
          }}
          required
          type="password"
          value={confirmPassword}
        />
      </label>
      <Button className="w-full" size="lg" type="submit">Create account</Button>
    </form>
  )
}
