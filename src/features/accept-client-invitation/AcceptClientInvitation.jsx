import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button, CardContent, PrimitiveCard as Card, statusToneClasses } from '@/shared/ui'

import {
  acceptClientInvitation,
  getClientInvitationByToken,
  getInvitationStatus,
  requestClientInvitationAccessLink,
} from '../../domain/services/clientInviteService'
import { ROUTE_PATHS, withSearchParams } from '../../domain/navigation/routePaths'
import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../entities/client-invitation'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { Icon } from '../../shared/icons'
import { useToast } from '../../shared/notifications'
import { getAbsoluteAppHref, getAppHref } from '../../shared/routing'
import { BrandLogo } from '../../shared/ui'
import { CreateInviteAccountForm, RecoveryInviteForm } from './AcceptInviteForms'

function createUuid() {
  return crypto.randomUUID()
}

function buildAcceptInviteLink(token) {
  if (typeof window === 'undefined') {
    return getAppHref(`/accept-invite?token=${token}`)
  }

  return getAbsoluteAppHref(`/accept-invite?token=${token}`)
}

function getInviteStateMessage(invitationContext, status) {
  if (!invitationContext) {
    return 'This invitation link is missing or invalid. Ask your team for a new invite.'
  }

  if (status === CLIENT_INVITATION_STATUSES.ACCEPTED) {
    return `This invitation for ${invitationContext.client.name} was already accepted. Sign in to continue.`
  }

  if (status === CLIENT_INVITATION_STATUSES.CANCELLED) {
    return `This invitation for ${invitationContext.client.name} was cancelled by the team.`
  }

  if (status === CLIENT_INVITATION_STATUSES.EXPIRED) {
    return `This invitation for ${invitationContext.client.name} has expired. Ask your team for a new invite.`
  }

  return `You were invited to ${invitationContext.client.name}.`
}

function getSafeLoginHref(token) {
  return `/login?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`
}

export function AcceptClientInvitation({ onAuthChange, runtime, token }) {
  const navigate = useNavigate()
  const toast = useToast()
  const invitationResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? 'anonymous'}:client-invitation:${token ?? ''}`,
    initialData: null,
    load: () => {
      if (!token) {
        return Promise.resolve(null)
      }

      return runtime.dataClient.read((repositories) => {
        try {
          return getClientInvitationByToken({
            repositories,
            token,
          })
        } catch {
          return null
        }
      })
    },
  })
  const invitationContext = invitationResource.data
  const inviteStatus = invitationContext
    ? getInvitationStatus(invitationContext.invitation)
    : null
  const canAcceptInvite = inviteStatus === CLIENT_INVITATION_STATUSES.PENDING
  const inviteStatusMeta = CLIENT_INVITATION_STATUS_META[inviteStatus] ?? {
    icon: 'triangleAlert',
    tone: 'amber',
  }
  const existingProfile = invitationContext?.profile ?? null
  const viewer = runtime.viewer
  const viewerMatchesInvite = Boolean(
    existingProfile
    && viewer?.userId
    && viewer.userId === existingProfile.user_id,
  )
  const viewerMismatch = Boolean(
    existingProfile
    && viewer?.userId
    && viewer.userId !== existingProfile.user_id,
  )
  const shouldCreateAccount = canAcceptInvite && !existingProfile
  const shouldSignIn = canAcceptInvite && existingProfile && !viewer?.userId
  const shouldAcceptExistingAccount = canAcceptInvite && viewerMatchesInvite
  const email = invitationContext?.invitation.email ?? ''
  const [nameDraft, setNameDraft] = useState(null)
  const name = nameDraft ?? invitationContext?.invitation.name ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [error, setError] = useState('')

  function handleRecoverySubmit(event) {
    event.preventDefault()

    void runtime.dataClient.write((repositories) => requestClientInvitationAccessLink({
      email: recoveryEmail,
      idGenerator: createUuid,
      repositories,
    })).then((result) => {
      setError('')
      setRecoveryMessage(result.message)

      if (result.sent && result.accessToken?.token) {
        toast.info('Secure invite link', buildAcceptInviteLink(result.accessToken.token), {
          duration: 12000,
        })
      } else {
        toast.info('Secure link requested', result.message)
      }
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Secure link was not sent', caughtError.message)
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!canAcceptInvite) {
      setError('This invitation cannot be accepted.')
      return
    }

    void runtime.dataClient.write((repositories) => acceptClientInvitation({
        confirmPassword,
        email,
        idGenerator: createUuid,
        name,
        password,
        repositories,
        token,
        viewer,
      })).then((result) => {
      onAuthChange?.()
      toast.success('Invitation accepted', `You now have access to ${result.client.name}.`)
      navigate(withSearchParams(ROUTE_PATHS.portalGrowthReview, { clientId: result.client.id }), { replace: true })
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Invite was not accepted', caughtError.message)
    })
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-form bg-material-vibrant shadow-premium backdrop-blur-2xl">
          <CardContent className="p-8">
            <BrandLogo href="/" variant="static" />

            <div className="mt-10">
              <p className="text-ui text-brand">Portal invite</p>
              <h1 className="mt-2 text-display text-text-primary">
                {token ? 'Accept your invitation' : 'Find your invitation'}
              </h1>
              <p className="mt-2 text-body text-text-secondary">
                {token
                  ? 'Confirm your account details to access your workspace.'
                  : 'Enter the email address where you received your portal invitation.'}
              </p>
            </div>

            {token ? (
              <div className={`mt-5 flex items-start gap-2 rounded-control border px-control py-control text-ui ${statusToneClasses[inviteStatusMeta.tone] ?? statusToneClasses.amber}`}>
                <Icon className="mt-0.5 shrink-0" name={inviteStatusMeta.icon} size={15} />
                {invitationResource.status === 'loading'
                  ? 'Checking invitation...'
                  : getInviteStateMessage(invitationContext, inviteStatus)}
              </div>
            ) : null}

            {!token ? (
              <RecoveryInviteForm
                error={error}
                onSubmit={handleRecoverySubmit}
                recoveryEmail={recoveryEmail}
                recoveryMessage={recoveryMessage}
                setError={setError}
                setRecoveryEmail={setRecoveryEmail}
              />
            ) : null}

            {shouldCreateAccount ? (
              <CreateInviteAccountForm
                confirmPassword={confirmPassword}
                email={email}
                name={name}
                onSubmit={handleSubmit}
                password={password}
                setConfirmPassword={setConfirmPassword}
                setError={setError}
                setName={setNameDraft}
                setPassword={setPassword}
              />
            ) : null}

            {shouldSignIn ? (
              <div className="mt-8 grid gap-4">
                <p className="rounded-control bg-block-subtle px-control py-control text-ui text-text-secondary">
                  This email already has a portal account. Sign in to accept this pending invitation.
                </p>
                <Button asChild className="w-full" size="lg">
                  <Link to={getSafeLoginHref(token)}>Sign in to accept invitation</Link>
                </Button>
              </div>
            ) : null}

            {shouldAcceptExistingAccount ? (
              <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                <p className="rounded-control bg-block-subtle px-control py-control text-ui text-text-secondary">
                  You are signed in as {existingProfile.email}. Accept this invitation to add the workspace to your account.
                </p>
                <Button className="w-full" size="lg" type="submit">Accept invitation</Button>
              </form>
            ) : null}

            {viewerMismatch ? (
              <p className="mt-8 rounded-control bg-destructive/10 px-control py-item text-ui text-destructive">
                This invitation belongs to another account. Sign in with {existingProfile.email} to continue.
              </p>
            ) : null}

            {token && error ? (
              <p className="mt-4 rounded-control bg-destructive/10 px-control py-item text-ui text-destructive">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-ui text-text-secondary">
              Already have access?{' '}
              <Link className="font-medium text-brand no-underline hover:text-brand/80" to="/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
