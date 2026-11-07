import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button, ErrorBlock } from '../../shared/ui'
import { AuthInput } from './AuthInput'
import { EmailCodeLoginForm } from './EmailCodeLoginForm'

const DEFAULT_EMAIL_CODE_DETAIL = 'If an account exists for this email, a sign-in code has been sent.'

function AuthModeTabs({ mode, onChange }) {
  const items = [
    { label: 'Password', value: 'password' },
    { label: 'Email code', value: 'emailCode' },
  ]

  return (
    <div
      aria-label="Sign in method"
      className="inline-flex w-full rounded-control bg-control p-micro"
      role="tablist"
    >
      {items.map((item) => (
        <Button
          aria-selected={mode === item.value}
          className={`h-control-small flex-1 rounded-control px-control text-label font-medium transition-colors duration-motion-fast ease-motion-standard ${
            mode === item.value
              ? 'bg-control-selected text-text-primary'
              : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
          }`}
          key={item.value}
          onClick={() => onChange(item.value)}
          role="tab"
          type="button"
          variant="ghost"
        >
          {item.label}
        </Button>
      ))}
    </div>
  )
}

function PasswordLoginForm({ email, onEmailChange, onSubmit, status }) {
  const [password, setPassword] = useState('')
  const submitting = status === 'submitting'

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ email: email.trim(), password })
  }

  return (
    <form className="grid gap-component" onSubmit={handleSubmit}>
      <AuthInput
        autoComplete="email"
        iconName="mail"
        inputMode="email"
        label="Email"
        name="email"
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="Email"
        required
        type="email"
        value={email}
      />

      <AuthInput
        autoComplete="current-password"
        iconName="lock"
        label="Password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />

      <Link
        className="justify-self-end text-ui font-medium text-brand no-underline hover:text-brand/80"
        to="/forgot-password"
      >
        Forgot password?
      </Link>

      <Button className="w-full" disabled={submitting} size="lg" type="submit">
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

export function AuthLoginPanel({
  initialEmail = '',
  onAuthenticated,
  onEmailCodeRequest,
  onEmailCodeSignIn,
  onError,
  onPasswordSignIn,
}) {
  const [mode, setMode] = useState('password')
  const [email, setEmail] = useState(initialEmail)
  const [emailCodeStep, setEmailCodeStep] = useState('email')
  const [emailCodeDetail, setEmailCodeDetail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function handleEmailChange(nextEmail) {
    setEmail(nextEmail)
    setError('')
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setError('')
  }

  function handleError(caughtError) {
    setError(caughtError.message)
    onError?.(caughtError)
  }

  function handlePasswordSignIn(credentials) {
    setStatus('submitting')
    setError('')

    void onPasswordSignIn(credentials)
      .then(onAuthenticated)
      .catch(handleError)
      .finally(() => {
        setStatus('idle')
      })
  }

  async function handleRequestCode(credentials) {
    setStatus('sending')
    setError('')

    try {
      const payload = await onEmailCodeRequest(credentials)

      setEmailCodeDetail(payload?.detail || DEFAULT_EMAIL_CODE_DETAIL)
      setEmailCodeStep('code')

      return {
        ok: true,
        retryAfter: payload?.retry_after ?? 30,
      }
    } catch (caughtError) {
      handleError(caughtError)
      return { ok: false, retryAfter: 0 }
    } finally {
      setStatus('idle')
    }
  }

  function handleVerifyCode(credentials) {
    setStatus('verifying')
    setError('')

    void onEmailCodeSignIn(credentials)
      .then(onAuthenticated)
      .catch(handleError)
      .finally(() => {
        setStatus('idle')
      })
  }

  return (
    <div>
      <div>
        <p className="text-ui text-brand">Welcome back</p>
        <h2 className="mt-item text-display text-text-primary">Sign in</h2>
        <p className="mt-item text-body text-text-secondary">
          Use your password or a one-time email code.
        </p>
      </div>

      <div className="mt-panel grid gap-component">
        <AuthModeTabs mode={mode} onChange={handleModeChange} />

        {mode === 'password' ? (
          <PasswordLoginForm
            email={email}
            onEmailChange={handleEmailChange}
            onSubmit={handlePasswordSignIn}
            status={status}
          />
        ) : (
          <EmailCodeLoginForm
            detail={emailCodeDetail}
            email={email}
            onEmailChange={handleEmailChange}
            onRequestCode={handleRequestCode}
            onUseAnotherEmail={() => {
              setEmailCodeStep('email')
              setEmailCodeDetail('')
              setError('')
            }}
            onVerifyCode={handleVerifyCode}
            status={status}
            step={emailCodeStep}
          />
        )}
      </div>

      {error ? (
        <div className="mt-component">
          <ErrorBlock title="Sign in failed">{error}</ErrorBlock>
        </div>
      ) : null}

      <p className="mt-card text-center text-ui text-text-secondary">
        Have an invitation?{' '}
        <Link className="font-medium text-brand no-underline hover:text-brand/80" to="/accept-invite">
          Accept it
        </Link>
      </p>
    </div>
  )
}
