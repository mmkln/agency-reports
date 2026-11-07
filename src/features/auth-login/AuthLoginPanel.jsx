import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '../../shared/icons'
import { Button, ErrorBlock, Input } from '../../shared/ui'
import { OneTimeCodeInput } from './OneTimeCodeInput'

const DEFAULT_EMAIL_CODE_DETAIL = 'If an account exists for this email, a sign-in code has been sent.'

function maskEmail(email) {
  const [localPart, domainPart] = String(email ?? '').split('@')

  if (!localPart || !domainPart) {
    return String(email ?? '')
  }

  const maskedLocal = localPart.length <= 1 ? '*' : `${localPart[0]}***`
  return `${maskedLocal}@${domainPart}`
}

function AuthInput({ error = '', iconName, label, ...props }) {
  return (
    <label className="grid gap-item">
      <span className="text-label text-text-secondary">{label}</span>
      <span className="relative block">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-control top-1/2 -translate-y-1/2 text-text-muted"
          name={iconName}
          size={18}
        />
        <Input aria-invalid={error ? 'true' : undefined} className="pl-layout" {...props} />
      </span>
      {error ? <span className="text-label font-normal text-destructive">{error}</span> : null}
    </label>
  )
}

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

function EmailCodeLoginForm({
  detail,
  email,
  onEmailChange,
  onRequestCode,
  onUseAnotherEmail,
  onVerifyCode,
  step,
  status,
}) {
  const [code, setCode] = useState('')
  const sending = status === 'sending'
  const verifying = status === 'verifying'
  const isCodeComplete = code.length === 6

  if (step === 'code') {
    return (
      <form className="grid gap-component" onSubmit={(event) => {
        event.preventDefault()
        if (!isCodeComplete) {
          return
        }

        onVerifyCode({ code: code.trim(), email: email.trim() })
      }}>
        <div className="grid gap-item">
          <p className="text-ui text-text-secondary">
            Sent to <span className="font-medium text-text-primary">{maskEmail(email)}</span>
          </p>
          {detail ? <p className="text-label font-normal text-text-muted">{detail}</p> : null}
        </div>

        <OneTimeCodeInput
          autoFocus
          disabled={verifying}
          onChange={setCode}
          value={code}
        />

        <div className="flex flex-col-reverse gap-control sm:flex-row sm:justify-end">
          <Button disabled={verifying} onClick={onUseAnotherEmail} type="button" variant="secondary">
            Use another email
          </Button>
          <Button disabled={!isCodeComplete || verifying} type="submit">
            {verifying ? 'Checking...' : 'Continue'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form className="grid gap-component" onSubmit={(event) => {
      event.preventDefault()
      setCode('')
      onRequestCode({ email: email.trim() })
    }}>
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

      <Button className="w-full" disabled={sending} size="lg" type="submit">
        {sending ? 'Sending...' : 'Send code'}
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

  function handleRequestCode(credentials) {
    setStatus('sending')
    setError('')
    setEmailCodeDetail('')

    void onEmailCodeRequest(credentials)
      .then((payload) => {
        setEmailCodeDetail(payload?.detail || DEFAULT_EMAIL_CODE_DETAIL)
        setEmailCodeStep('code')
      })
      .catch(handleError)
      .finally(() => {
        setStatus('idle')
      })
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
