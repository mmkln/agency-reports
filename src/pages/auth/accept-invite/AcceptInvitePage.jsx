import { useMemo, useState } from 'react'

import { Button, CardContent, Input, PrimitiveCard as Card, statusToneClasses } from '@/shared/ui'

import {
  acceptClientInvitation,
  getClientInvitationByToken,
  getInvitationStatus,
} from '../../../domain/services/clientInviteService'
import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../../entities/client-invitation'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'

function createUuid() {
  return crypto.randomUUID()
}

function getInviteStateMessage(invitationContext, status) {
  if (!invitationContext) {
    return 'Add a valid invite token to the URL. Example: #accept-invite?token=invite-token'
  }

  if (status === CLIENT_INVITATION_STATUSES.ACCEPTED) {
    return `This invitation for ${invitationContext.client.name} was already accepted. Sign in to continue.`
  }

  if (status === CLIENT_INVITATION_STATUSES.CANCELLED) {
    return `This invitation for ${invitationContext.client.name} was cancelled by the agency.`
  }

  if (status === CLIENT_INVITATION_STATUSES.EXPIRED) {
    return `This invitation for ${invitationContext.client.name} has expired. Ask your agency for a new invite.`
  }

  return `You were invited to ${invitationContext.client.name}.`
}

export function AcceptInvitePage({ onAuthChange, routeParams, runtime }) {
  const toast = useToast()
  const token = routeParams.token ?? ''
  const invitationContext = useMemo(() => {
    if (!token) {
      return null
    }

    try {
      return getClientInvitationByToken({
        repositories: runtime.repositories,
        token,
      })
    } catch {
      return null
    }
  }, [runtime.repositories, token])
  const [email, setEmail] = useState(invitationContext?.invitation.email ?? '')
  const [name, setName] = useState(invitationContext?.invitation.name ?? '')
  const [error, setError] = useState('')
  const inviteStatus = invitationContext
    ? getInvitationStatus(invitationContext.invitation)
    : null
  const canAcceptInvite = inviteStatus === CLIENT_INVITATION_STATUSES.PENDING
  const inviteStatusMeta = CLIENT_INVITATION_STATUS_META[inviteStatus] ?? {
    icon: 'triangleAlert',
    tone: 'amber',
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!canAcceptInvite) {
      setError('This invitation cannot be accepted.')
      return
    }

    try {
      const result = acceptClientInvitation({
        email,
        idGenerator: createUuid,
        name,
        repositories: runtime.repositories,
        token,
      })

      onAuthChange?.()
      toast.success('Invitation accepted', `You now have access to ${result.client.name}.`)
      window.location.hash = `client-overview?clientId=${result.client.id}`
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Invite was not accepted', caughtError.message)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-form bg-material-vibrant shadow-premium backdrop-blur-2xl">
          <CardContent className="p-8">
            <BrandLogo href="#landing" variant="static" />

            <div className="mt-10">
              <p className="text-sm font-semibold text-brand">Client portal invite</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">Accept your invitation</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Confirm your email and name to access your client status hub.
              </p>
            </div>

            <div className={`mt-5 flex items-start gap-2 rounded-control border px-control py-control text-sm ${statusToneClasses[inviteStatusMeta.tone] ?? statusToneClasses.amber}`}>
              <Icon className="mt-0.5 shrink-0" name={inviteStatusMeta.icon} size={15} />
              {getInviteStateMessage(invitationContext, inviteStatus)}
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-text-secondary">Name</span>
                <Input
                  autoComplete="name"
                  minLength={2}
                  name="name"
                  disabled={!canAcceptInvite}
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
                <span className="text-sm font-medium text-text-secondary">Email address</span>
                <Input
                  autoComplete="email"
                  name="email"
                  disabled={!canAcceptInvite}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <Button className="w-full" disabled={!canAcceptInvite} size="lg" type="submit">
                Accept invite
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-control bg-destructive/10 px-control py-item text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have access?{' '}
              <a className="font-medium text-brand no-underline hover:text-brand/80" href="#login">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
