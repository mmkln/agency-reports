import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getHomeHrefForViewer } from '../../domain/services/viewerHomeService'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { useToast } from '../../shared/notifications'
import { Button, ErrorBlock } from '../../shared/ui'
import {
  acceptInvitationWithEmailCode,
  requestInvitationEmailCode,
  verifyInvitationEmailCode,
} from '../invitations'
import { getPostAcceptLoginHref, REDIRECT_DELAY_MS } from './acceptWorkspaceInvitationUtils'
import {
  AcceptInvitationForm,
  AcceptedInviteState,
  AuthInput,
} from './AcceptWorkspaceInvitationViews'
import { getInvitationRecoveryErrorMessage } from './acceptWorkspaceInvitationErrors'

export function EmailCodeInviteRecovery({ auth }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const [recoveryToken, setRecoveryToken] = useState('')
  const [invitations, setInvitations] = useState([])
  const [selectedInvitationId, setSelectedInvitationId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordConfirmationError, setPasswordConfirmationError] = useState('')
  const [acceptStatus, setAcceptStatus] = useState('idle')

  const selectedInvitation = useMemo(() => {
    if (!selectedInvitationId) {
      return invitations[0] ?? null
    }

    return invitations.find((invitation) => invitation.id === selectedInvitationId) ?? null
  }, [invitations, selectedInvitationId])
  const shouldCreateUser = Boolean(selectedInvitation && !selectedInvitation.existing_user_exists)

  function requestCode(event) {
    event.preventDefault()
    setError('')
    setDetail('')

    void requestInvitationEmailCode(
      auth.runtime.apiClient,
      { email },
      { skipAuth: true },
    ).then((payload) => {
      setDetail(payload.detail || 'If an active invitation exists for this email, a code has been sent.')
      setStep('code')
    }).catch((caughtError) => {
      setError(getInvitationRecoveryErrorMessage(
        caughtError,
        'Invite recovery is not available right now. Use the latest invitation email or try again later.',
      ))
    })
  }

  function verifyCode(event) {
    event.preventDefault()
    setError('')

    void verifyInvitationEmailCode(
      auth.runtime.apiClient,
      { code, email },
      { skipAuth: true },
    ).then((payload) => {
      const nextInvitations = payload.invitations ?? []
      const nextInvitation = nextInvitations[0] ?? null
      setRecoveryToken(payload.recovery_token)
      setInvitations(nextInvitations)
      setSelectedInvitationId(nextInvitation?.id ?? '')
      setName(nextInvitation?.name ?? '')
      setStep('accept')
    }).catch((caughtError) => {
      setError(getInvitationRecoveryErrorMessage(
        caughtError,
        'The code could not be verified. Try again.',
      ))
    })
  }

  function acceptRecoveredInvitation(event) {
    event.preventDefault()

    if (!selectedInvitation || !recoveryToken) {
      return
    }

    setError('')
    setPasswordConfirmationError('')

    if (shouldCreateUser && password !== passwordConfirmation) {
      setPasswordConfirmationError('Passwords do not match.')
      return
    }

    setAcceptStatus('accepting')

    const body = shouldCreateUser
      ? {
        invitation_id: selectedInvitation.id,
        name,
        password,
        recovery_token: recoveryToken,
      }
      : {
        invitation_id: selectedInvitation.id,
        recovery_token: recoveryToken,
      }

    void acceptInvitationWithEmailCode(
      auth.runtime.apiClient,
      body,
      { skipAuth: !auth.viewer },
    ).then((payload) => {
      setAcceptStatus('accepted')
      setInvitations((current) => current.map((invitation) => (
        invitation.id === selectedInvitation.id
          ? { ...invitation, status: CLIENT_INVITATION_STATUSES.ACCEPTED }
          : invitation
      )))
      toast.success('Invitation accepted', `${payload.workspace?.name ?? selectedInvitation.workspace_name} is ready.`)

      if (auth.viewer) {
        void auth.authClient.getCurrentViewer().then((viewer) => {
          auth.onAuthChange?.()
          navigate(getHomeHrefForViewer(viewer), { replace: true })
        })
        return
      }

      window.setTimeout(() => {
        navigate(getPostAcceptLoginHref(payload.workspace?.id), { replace: true })
      }, REDIRECT_DELAY_MS)
    }).catch((caughtError) => {
      const message = getInvitationRecoveryErrorMessage(
        caughtError,
        'Invitation was not accepted. Try again.',
      )
      setAcceptStatus('idle')
      setError(message)
      toast.error('Invitation was not accepted', message)
    })
  }

  if (acceptStatus === 'accepted' && selectedInvitation) {
    return <AcceptedInviteState invitation={selectedInvitation} />
  }

  if (step === 'email') {
    return (
      <form className="grid gap-card" onSubmit={requestCode}>
        <div className="grid gap-item text-center">
          <h1 className="text-heading text-text-primary">Find your invitation</h1>
          <p className="text-body text-text-secondary">Enter the email address your agency invited.</p>
        </div>
        <AuthInput
          autoComplete="email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        {error ? <ErrorBlock title="Code could not be sent">{error}</ErrorBlock> : null}
        <Button size="lg" type="submit">Send code</Button>
      </form>
    )
  }

  if (step === 'code') {
    return (
      <form className="grid gap-card" onSubmit={verifyCode}>
        <div className="grid gap-item text-center">
          <h1 className="text-heading text-text-primary">Enter the one-time code</h1>
          <p className="text-body text-text-secondary">{detail}</p>
        </div>
        <AuthInput
          autoComplete="one-time-code"
          inputMode="numeric"
          label="Code"
          maxLength={6}
          onChange={(event) => setCode(event.target.value)}
          pattern="[0-9]{6}"
          placeholder="123456"
          required
          value={code}
        />
        {error ? <ErrorBlock title="Code could not be verified">{error}</ErrorBlock> : null}
        <div className="flex flex-col-reverse gap-control sm:flex-row sm:justify-end">
          <Button onClick={() => setStep('email')} type="button" variant="secondary">
            Use another email
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    )
  }

  if (!selectedInvitation) {
    return <ErrorBlock title="Invitation could not be found">Request a new code from the invited email.</ErrorBlock>
  }

  return (
    <div className="grid gap-card">
      {invitations.length > 1 ? (
        <div className="grid gap-component">
          <div className="grid gap-micro">
            <h1 className="text-heading text-text-primary">Choose an invitation</h1>
            <p className="text-body text-text-secondary">This email has more than one pending workspace invite.</p>
          </div>
          <div className="grid gap-control">
            {invitations.map((invitation) => (
              <Button
                key={invitation.id}
                onClick={() => {
                  setSelectedInvitationId(invitation.id)
                  setName(invitation.name ?? '')
                  setError('')
                }}
                type="button"
                variant={selectedInvitation.id === invitation.id ? 'primary' : 'secondary'}
              >
                {invitation.workspace_name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      <AcceptInvitationForm
        acceptStatus={acceptStatus}
        error={error}
        invitation={selectedInvitation}
        name={name}
        onNameChange={(event) => setName(event.target.value)}
        onPasswordChange={(event) => {
          setPassword(event.target.value)
          setPasswordConfirmationError('')
        }}
        onPasswordConfirmationChange={(event) => {
          setPasswordConfirmation(event.target.value)
          setPasswordConfirmationError('')
        }}
        onSubmit={acceptRecoveredInvitation}
        password={password}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationError={passwordConfirmationError}
        shouldCreateUser={shouldCreateUser}
      />
    </div>
  )
}
