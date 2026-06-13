import { Link } from 'react-router-dom'

import { CLIENT_INVITATION_STATUS_META, CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { WORKSPACE_ROLE_META } from '../../entities/workspace-membership'
import { Icon } from '../../shared/icons'
import {
  BrandLogo,
  Button,
  CardContent,
  ErrorBlock,
  Input,
  PrimitiveCard as Card,
  StatusBadge,
} from '../../shared/ui'
import {
  formatInvitationDate,
  getInactiveInvitationCopy,
  getPostAcceptLoginHref,
} from './acceptWorkspaceInvitationUtils'

export function AcceptInvitationLayout({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background-grouped-tertiary px-app-gutter py-page text-text-primary">
      <div className="mx-auto w-full max-w-modal-lg">
        <Card className="w-full overflow-hidden border border-block-border bg-block p-0 py-0">
          <CardContent className="grid gap-panel p-panel lg:p-page">
            <div className="flex items-center justify-between gap-component">
              <BrandLogo href="/" size="sm" variant="static" />
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export function AuthInput({ label, ...props }) {
  return (
    <label className="grid gap-item">
      <span className="text-label text-text-secondary">{label}</span>
      <Input {...props} />
    </label>
  )
}

export function InvitationSummary({ invitation }) {
  const roleLabel = WORKSPACE_ROLE_META[invitation.role]?.label ?? invitation.role

  return (
    <div className="grid gap-component rounded-block bg-block-subtle p-card">
      <div className="flex items-start justify-between gap-component">
        <div className="min-w-0">
          <p className="text-label text-text-muted">Workspace</p>
          <h2 className="mt-micro truncate text-heading text-text-primary">{invitation.workspace_name}</h2>
        </div>
        <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
      </div>
      <dl className="grid gap-control text-ui sm:grid-cols-2">
        <div>
          <dt className="text-label text-text-muted">Email</dt>
          <dd className="mt-micro truncate text-text-primary">{invitation.email}</dd>
        </div>
        <div>
          <dt className="text-label text-text-muted">Role</dt>
          <dd className="mt-micro text-text-primary">{roleLabel}</dd>
        </div>
        <div>
          <dt className="text-label text-text-muted">Name</dt>
          <dd className="mt-micro truncate text-text-primary">{invitation.name || 'Not provided'}</dd>
        </div>
        <div>
          <dt className="text-label text-text-muted">Expires</dt>
          <dd className="mt-micro text-text-primary">{formatInvitationDate(invitation.expires_at)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function LoadingInviteState() {
  return <div className="min-h-[260px] animate-pulse rounded-block bg-block-subtle" />
}

export function InvalidInviteState() {
  return (
    <div className="grid gap-component text-center">
      <Icon className="mx-auto text-text-quaternary" name="circleAlert" size={34} />
      <h1 className="text-heading text-text-primary">Invite link not found</h1>
      <p className="text-body text-text-secondary">Use the latest invitation email from your agency team.</p>
    </div>
  )
}

export function InactiveInviteState({ invitation }) {
  const copy = getInactiveInvitationCopy(invitation?.status)

  return (
    <div className="grid gap-card">
      {invitation ? <InvitationSummary invitation={invitation} /> : null}
      <div className="grid gap-component text-center">
        <Icon className="mx-auto text-text-quaternary" name={copy.iconName} size={34} />
        <h1 className="text-heading text-text-primary">{copy.title}</h1>
        <p className="text-body text-text-secondary">{copy.description}</p>
        {invitation?.status === CLIENT_INVITATION_STATUSES.ACCEPTED ? (
          <Button asChild>
            <Link to={getPostAcceptLoginHref()}>Continue to sign in</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function AcceptedInviteState({ invitation }) {
  return (
    <div className="grid gap-card">
      <InvitationSummary invitation={invitation} />
      <div className="grid gap-component text-center">
        <Icon className="mx-auto text-success-foreground" name="checkCircle2" size={36} />
        <h1 className="text-heading text-text-primary">Invitation accepted</h1>
        <p className="text-body text-text-secondary">Continue to sign in and open your portal.</p>
        <Button asChild>
          <Link to={getPostAcceptLoginHref()}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}

export function LoginRequiredState({ auth, invitation, loginHref, onSignOut }) {
  return (
    <div className="grid gap-card">
      <InvitationSummary invitation={invitation} />
      <div className="grid gap-component">
        <h1 className="text-heading text-text-primary">Log in with the invited email</h1>
        <p className="text-body text-text-secondary">This invite belongs to {invitation.email}.</p>
        {auth.viewer ? (
          <Button onClick={onSignOut} type="button">
            Sign out and continue
          </Button>
        ) : (
          <Button asChild>
            <Link to={loginHref}>Continue to login</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function AcceptInvitationForm({
  acceptStatus,
  error,
  invitation,
  name,
  onNameChange,
  onPasswordChange,
  onSubmit,
  password,
  shouldCreateUser,
}) {
  return (
    <form className="grid gap-card" onSubmit={onSubmit}>
      <InvitationSummary invitation={invitation} />
      {shouldCreateUser ? (
        <div className="grid gap-component">
          <AuthInput
            autoComplete="name"
            label="Name"
            minLength={2}
            onChange={onNameChange}
            placeholder="Sarah Johnson"
            required
            value={name}
          />
          <AuthInput
            autoComplete="new-password"
            label="Password"
            minLength={8}
            onChange={onPasswordChange}
            placeholder="Create a password"
            required
            type="password"
            value={password}
          />
        </div>
      ) : null}
      {error ? <ErrorBlock title="Invite was not accepted">{error}</ErrorBlock> : null}
      <Button disabled={acceptStatus === 'accepting'} size="lg" type="submit">
        {acceptStatus === 'accepting' ? 'Accepting...' : 'Accept invitation'}
      </Button>
    </form>
  )
}
