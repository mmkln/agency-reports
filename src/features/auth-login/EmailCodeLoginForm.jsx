import { useEffect, useState } from 'react'

import { Button } from '../../shared/ui'
import { AuthInput } from './AuthInput'
import { OneTimeCodeInput } from './OneTimeCodeInput'

function maskEmail(email) {
  const [localPart, domainPart] = String(email ?? '').split('@')

  if (!localPart || !domainPart) {
    return String(email ?? '')
  }

  const maskedLocal = localPart.length <= 1 ? '*' : `${localPart[0]}***`
  return `${maskedLocal}@${domainPart}`
}

export function EmailCodeLoginForm({
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
  const [cooldown, setCooldown] = useState(0)
  const [inputVersion, setInputVersion] = useState(0)
  const sending = status === 'sending'
  const verifying = status === 'verifying'
  const isCodeComplete = code.length === 6

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [cooldown])

  async function requestCode() {
    const result = await onRequestCode({ email: email.trim() })

    if (!result.ok) {
      return
    }

    setCode('')
    setCooldown(result.retryAfter)
    setInputVersion((value) => value + 1)
  }

  function useAnotherEmail() {
    setCode('')
    setCooldown(0)
    onUseAnotherEmail()
  }

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
          <div className="flex items-center justify-between gap-component">
            <p className="text-ui text-text-secondary">
              Sent to <span className="font-medium text-text-primary">{maskEmail(email)}</span>
            </p>
            <Button
              className="h-auto px-0 py-0"
              disabled={sending || verifying}
              onClick={useAnotherEmail}
              type="button"
              variant="link"
            >
              Change
            </Button>
          </div>
          {detail ? <p className="text-label font-normal text-text-muted">{detail}</p> : null}
        </div>

        <OneTimeCodeInput
          autoFocus
          disabled={sending || verifying}
          key={inputVersion}
          onChange={setCode}
          value={code}
        />

        <div
          aria-live="polite"
          className="flex items-center justify-center gap-tag text-label text-text-secondary"
        >
          <span>Didn&apos;t receive a code?</span>
          <Button
            className="h-auto px-0 py-0 disabled:bg-transparent"
            disabled={cooldown > 0 || sending || verifying}
            onClick={() => void requestCode()}
            type="button"
            variant="link"
          >
            {sending
              ? 'Sending...'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend code'}
          </Button>
        </div>

        <Button
          className="w-full"
          disabled={!isCodeComplete || sending || verifying}
          size="lg"
          type="submit"
        >
          {verifying ? 'Checking...' : 'Continue'}
        </Button>
      </form>
    )
  }

  return (
    <form className="grid gap-component" onSubmit={(event) => {
      event.preventDefault()
      void requestCode()
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
