import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { EmailCodeLoginForm } from './EmailCodeLoginForm'

describe('EmailCodeLoginForm', () => {
  it('renders a restrained resend flow for the code step', () => {
    const html = renderToStaticMarkup(
      <EmailCodeLoginForm
        detail="If an account exists for this email, a sign-in code has been sent."
        email="member@example.com"
        onEmailChange={vi.fn()}
        onRequestCode={vi.fn()}
        onUseAnotherEmail={vi.fn()}
        onVerifyCode={vi.fn()}
        status="idle"
        step="code"
      />,
    )

    expect(html).toContain('Sent to')
    expect(html).toContain('m***@example.com')
    expect(html).toContain('Change')
    expect(html).toContain('Didn&#x27;t receive a code?')
    expect(html).toContain('Resend code')
    expect(html).toContain('Continue')
    expect(html).not.toContain('Use another email')
  })
})
