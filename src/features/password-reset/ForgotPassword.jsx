import { useState } from 'react'
import { Link } from 'react-router-dom'

import { getEmailValidationIssue } from '../../shared/validation/email'
import { Button, ErrorBlock } from '../../shared/ui'
import {
  PasswordResetInput,
  PasswordResetLayout,
  PasswordResetState,
} from './PasswordResetViews'

const GENERIC_SUCCESS_MESSAGE = 'If an account exists for this email, reset instructions have been sent.'

export function ForgotPassword({ auth }) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function requestReset(event) {
    event.preventDefault()

    const nextEmail = email.trim()
    const nextEmailError = getEmailValidationIssue(nextEmail)

    setEmailError(nextEmailError)
    setError('')

    if (nextEmailError) {
      return
    }

    setStatus('submitting')

    void auth.authClient.requestPasswordReset({ email: nextEmail })
      .then(() => {
        setStatus('sent')
      })
      .catch((caughtError) => {
        setStatus('idle')
        setError(caughtError.message)
      })
  }

  if (status === 'sent') {
    return (
      <PasswordResetLayout
        description="Check your inbox for the next step."
        eyebrow="Account security"
        title="Reset email sent"
      >
        <PasswordResetState
          action={(
            <Button asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          )}
          iconName="mail"
          title="Check your email"
        >
          {GENERIC_SUCCESS_MESSAGE}
        </PasswordResetState>
      </PasswordResetLayout>
    )
  }

  return (
    <PasswordResetLayout
      description="Enter the email for your account and we will send a reset link if the account exists."
      eyebrow="Account security"
      title="Forgot password"
    >
      <form className="grid gap-card" onSubmit={requestReset}>
        <PasswordResetInput
          autoComplete="email"
          error={emailError}
          inputMode="email"
          label="Email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value)
            setEmailError('')
            setError('')
          }}
          placeholder="owner@example.com"
          required
          type="email"
          value={email}
        />
        {error ? <ErrorBlock title="Password reset could not be requested">{error}</ErrorBlock> : null}
        <Button disabled={status === 'submitting'} size="lg" type="submit">
          {status === 'submitting' ? 'Sending...' : 'Send reset link'}
        </Button>
        <p className="text-center text-ui text-text-secondary">
          Remembered your password?{' '}
          <Link className="font-medium text-brand no-underline hover:text-brand/80" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </PasswordResetLayout>
  )
}
