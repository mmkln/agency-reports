import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { BackendApiError } from '../../shared/api/backendApiClient'
import { Button, ErrorBlock } from '../../shared/ui'
import {
  PasswordResetInput,
  PasswordResetLayout,
  PasswordResetState,
  ResetTokenSummary,
} from './PasswordResetViews'

function getBackendErrorMessage(error) {
  const detail = error?.payload?.detail

  if (Array.isArray(detail)) {
    return detail.join(' ')
  }

  return error?.message ?? 'Password could not be updated.'
}

export function ResetPassword({ auth }) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [reset, setReset] = useState(null)
  const [status, setStatus] = useState('loading')
  const [loadedToken, setLoadedToken] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const currentStatus = !token
    ? 'invalid'
    : loadedToken === token
      ? status
      : 'loading'

  useEffect(() => {
    let ignore = false

    if (!token) {
      return undefined
    }

    void auth.authClient.getPasswordReset(token)
      .then((payload) => {
        if (ignore) {
          return
        }

        const nextReset = payload?.reset ?? null
        setReset(nextReset)
        setLoadedToken(token)
        setStatus(nextReset?.status === 'pending' ? 'ready' : 'inactive')
      })
      .catch((caughtError) => {
        if (ignore) {
          return
        }

        setLoadedToken(token)
        setStatus(caughtError instanceof BackendApiError && caughtError.status === 404 ? 'invalid' : 'error')
        setError(caughtError.message)
      })

    return () => {
      ignore = true
    }
  }, [auth.authClient, token])

  function confirmReset(event) {
    event.preventDefault()

    setError('')
    setPasswordConfirmError('')

    if (password !== passwordConfirm) {
      setPasswordConfirmError('Passwords do not match.')
      return
    }

    setStatus('submitting')

    void auth.authClient.confirmPasswordReset({
      password,
      passwordConfirm,
      token,
    }).then(() => {
      setStatus('success')
    }).catch((caughtError) => {
      setStatus('ready')
      setError(getBackendErrorMessage(caughtError))
    })
  }

  function renderBody() {
    if (currentStatus === 'loading') {
      return <div className="min-h-[260px] animate-pulse rounded-block bg-block-subtle" />
    }

    if (currentStatus === 'invalid') {
      return (
        <PasswordResetState
          action={(
            <Button asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          )}
          title="Reset link not found"
        >
          Use the latest password reset email or request a new link.
        </PasswordResetState>
      )
    }

    if (currentStatus === 'inactive') {
      return (
        <PasswordResetState
          action={(
            <Button asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          )}
          iconName="clock"
          title="Reset link is no longer active"
        >
          This password reset link was already used or expired.
        </PasswordResetState>
      )
    }

    if (currentStatus === 'error') {
      return <ErrorBlock title="Password reset could not be loaded">{error}</ErrorBlock>
    }

    if (currentStatus === 'success') {
      return (
        <PasswordResetState
          action={(
            <Button asChild>
              <Link to="/login">Continue to sign in</Link>
            </Button>
          )}
          iconName="checkCircle2"
          title="Password updated"
        >
          Use your new password the next time you sign in.
        </PasswordResetState>
      )
    }

    return (
      <form className="grid gap-card" onSubmit={confirmReset}>
        <ResetTokenSummary reset={reset} />
        <div className="grid gap-component">
          <PasswordResetInput
            autoComplete="new-password"
            label="New password"
            minLength={8}
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
            placeholder="Create a new password"
            required
            type="password"
            value={password}
          />
          <PasswordResetInput
            autoComplete="new-password"
            error={passwordConfirmError}
            label="Confirm password"
            minLength={8}
            onChange={(event) => {
              setPasswordConfirm(event.target.value)
              setPasswordConfirmError('')
              setError('')
            }}
            placeholder="Confirm your new password"
            required
            type="password"
            value={passwordConfirm}
          />
        </div>
        {error ? <ErrorBlock title="Password could not be updated">{error}</ErrorBlock> : null}
        <Button disabled={status === 'submitting'} size="lg" type="submit">
          {status === 'submitting' ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    )
  }

  return (
    <PasswordResetLayout
      description="Choose a new password for your account."
      eyebrow="Account security"
      title="Reset password"
    >
      {renderBody()}
    </PasswordResetLayout>
  )
}
