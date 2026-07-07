import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getHomeHrefForViewer } from '../../domain/services/viewerHomeService'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { BackendApiError } from '../../shared/api/backendApiClient'
import { useToast } from '../../shared/notifications'
import { ErrorBlock } from '../../shared/ui'
import { acceptInvitation as submitInvitationAcceptance, getInvitationByToken } from '../invitations'
import {
  getLoginHref,
  getPostAcceptLoginHref,
  REDIRECT_DELAY_MS,
} from './acceptWorkspaceInvitationUtils'
import {
  AcceptInvitationForm,
  AcceptInvitationLayout,
  AcceptedInviteState,
  InactiveInviteState,
  InvalidInviteState,
  LoadingInviteState,
  LoginRequiredState,
} from './AcceptWorkspaceInvitationViews'
import { EmailCodeInviteRecovery } from './EmailCodeInviteRecovery'

export function AcceptWorkspaceInvitation({ auth, token }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [invitation, setInvitation] = useState(null)
  const [status, setStatus] = useState(token ? 'loading' : 'invalid')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordConfirmationError, setPasswordConfirmationError] = useState('')
  const [acceptStatus, setAcceptStatus] = useState('idle')
  const loginHref = useMemo(() => (token ? getLoginHref(token) : '/login'), [token])
  const signedInEmail = auth.viewer?.email ?? auth.viewer?.user?.email ?? ''
  const isSignedInAsInvitedUser = Boolean(
    invitation?.email
    && signedInEmail
    && signedInEmail.toLowerCase() === invitation.email.toLowerCase(),
  )
  const shouldCreateUser = Boolean(invitation && !invitation.existing_user_exists)
  const requiresDifferentLogin = Boolean(invitation?.requires_login && !isSignedInAsInvitedUser)

  useEffect(() => {
    let ignore = false

    if (!token) {
      return undefined
    }

    void Promise.resolve()
      .then(() => {
        if (ignore) {
          return null
        }

        setStatus('loading')
        setError('')
        return getInvitationByToken(auth.runtime.apiClient, token, { skipAuth: !auth.viewer })
      })
      .then((payload) => {
        if (ignore || !payload) {
          return
        }

        const nextInvitation = payload.invitation
        setInvitation(nextInvitation)
        setName(nextInvitation?.name ?? '')
        setStatus('ready')
      })
      .catch((caughtError) => {
        if (ignore) {
          return
        }

        const controlledInvitation = caughtError?.payload?.invitation
        if (controlledInvitation) {
          setInvitation(controlledInvitation)
          setStatus('inactive')
          return
        }

        setError(caughtError.message)
        setStatus(caughtError instanceof BackendApiError && caughtError.status === 404 ? 'invalid' : 'error')
      })

    return () => {
      ignore = true
    }
  }, [auth.runtime.apiClient, auth.viewer, token])

  function signOutForInvite() {
    void auth.authClient.signOut().finally(() => {
      auth.onAuthChange?.()
      navigate(loginHref, { replace: true })
    })
  }

  function acceptInvitation(event) {
    event.preventDefault()

    if (!token || !invitation || requiresDifferentLogin) {
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
      ? { email: invitation.email, name, password }
      : { email: invitation.email }

    void submitInvitationAcceptance(auth.runtime.apiClient, token, body, { skipAuth: !auth.viewer }).then((payload) => {
      setAcceptStatus('accepted')
      setInvitation((current) => ({
        ...current,
        status: CLIENT_INVITATION_STATUSES.ACCEPTED,
      }))
      toast.success('Invitation accepted', `${payload.workspace?.name ?? invitation.workspace_name} is ready.`)

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
      const controlledInvitation = caughtError?.payload?.invitation
      if (controlledInvitation) {
        setInvitation(controlledInvitation)
        setStatus(controlledInvitation.status === CLIENT_INVITATION_STATUSES.PENDING ? 'ready' : 'inactive')
      }

      setAcceptStatus('idle')
      setError(caughtError.message)
      toast.error('Invitation was not accepted', caughtError.message)
    })
  }

  function renderBody() {
    if (!token) {
      return <EmailCodeInviteRecovery auth={auth} />
    }

    if (status === 'invalid') {
      return <InvalidInviteState />
    }

    if (status === 'loading') {
      return <LoadingInviteState />
    }

    if (status === 'error') {
      return <ErrorBlock title="Invitation could not be loaded">{error}</ErrorBlock>
    }

    if (status === 'inactive') {
      return <InactiveInviteState invitation={invitation} />
    }

    if (!invitation) {
      return null
    }

    if (acceptStatus === 'accepted') {
      return <AcceptedInviteState invitation={invitation} />
    }

    if (requiresDifferentLogin) {
      return (
        <LoginRequiredState
          auth={auth}
          invitation={invitation}
          loginHref={loginHref}
          onSignOut={signOutForInvite}
        />
      )
    }

    return (
      <AcceptInvitationForm
        acceptStatus={acceptStatus}
        error={error}
        invitation={invitation}
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
        onSubmit={acceptInvitation}
        password={password}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationError={passwordConfirmationError}
        shouldCreateUser={shouldCreateUser}
      />
    )
  }

  return <AcceptInvitationLayout>{renderBody()}</AcceptInvitationLayout>
}
