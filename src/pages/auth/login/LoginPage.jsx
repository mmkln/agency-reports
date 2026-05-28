import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, CardContent, Input, PrimitiveCard as Card } from '@/shared/ui'

import { getHomeHrefForViewer } from '../../../domain/services/authService'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'
import { useAuth } from '../../../app/providers/auth/useAuth'

const DEFAULT_USERNAME = ''

function AuthInput({ iconName, label, ...props }) {
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
        <Input className="pl-layout" {...props} />
      </span>
    </label>
  )
}

export function LoginPage({ onAuthChange }) {
  const auth = useAuth()
  const authClient = auth.authClient
  const resolvedOnAuthChange = onAuthChange ?? auth.onAuthChange
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [username, setUsername] = useState(DEFAULT_USERNAME)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function signIn(nextUsername, nextPassword) {
    void (auth.onSignIn ?? authClient.signInWithUsername)({
      username: nextUsername,
      password: nextPassword,
    }).then((viewer) => {
      resolvedOnAuthChange?.()
      toast.success('Signed in', `Welcome back, ${viewer.name}.`)
      const nextHref = searchParams.get('next')
      const safeNextHref = nextHref?.startsWith('/') && !nextHref.startsWith('//')
        ? nextHref
        : null

      navigate(safeNextHref ?? getHomeHrefForViewer(viewer), { replace: true })
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Sign in failed', caughtError.message)
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn(username, password)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background-grouped-tertiary px-app-gutter py-page text-text-primary">
      <div className="mx-auto w-full max-w-modal-xl">
        <Card className="w-full overflow-hidden border border-block-border bg-block p-0 py-0">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-2">
            <section className="flex min-w-0 flex-col justify-between gap-panel border-separator bg-surface-raised p-card lg:border-r lg:p-panel">
              <div className="grid gap-spacious">
                <BrandLogo href="/" size="sm" variant="static" />

                <div className="max-w-form">
                  <p className="text-ui font-semibold text-brand">AGENCY PORTAL</p>
                  <h1 className="mt-component text-display text-text-primary">
                    Secure access for client growth operations.
                  </h1>
                  <p className="mt-component text-body text-text-secondary">
                    Review work, reports, requests, resources, and client workspace access from one portal.
                  </p>
                </div>
              </div>

              <div className="grid gap-component">
                <div className="rounded-block bg-block p-component shadow-block">
                  <div className="flex items-center gap-component">
                    <span className="flex size-target shrink-0 items-center justify-center rounded-control bg-success-muted text-success-foreground">
                      <Icon name="shieldCheck" size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-ui font-semibold text-text-primary">Protected workspace</p>
                      <p className="text-ui text-text-secondary">Role-based agency and client access</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-block bg-block p-component shadow-block">
                  <p className="text-label text-text-muted">Account access</p>
                  <p className="mt-item text-ui text-text-secondary">
                    Sign in with your account credentials to access assigned workspaces.
                  </p>
                </div>
              </div>
            </section>

            <section className="flex items-center p-card lg:p-panel">
              <div className="mx-auto w-full max-w-form">
                <div>
                  <p className="text-ui text-brand">Welcome back</p>
                  <h2 className="mt-item text-display text-text-primary">Sign in to your account</h2>
                  <p className="mt-item text-body text-text-secondary">
                    Use your username to continue to the portal workspace.
                  </p>
                </div>

                <form className="mt-panel grid gap-component" onSubmit={handleSubmit}>
                  <AuthInput
                    autoComplete="username"
                    iconName="user"
                    label="Username"
                    name="username"
                    onChange={(event) => {
                      setUsername(event.target.value)
                      setError('')
                    }}
                    placeholder="Username"
                    required
                    type="text"
                    value={username}
                  />

                  <div className="grid gap-item">
                    <AuthInput
                      autoComplete="current-password"
                      iconName="lock"
                      label="Password"
                      name="password"
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setError('')
                      }}
                      placeholder="Password"
                      required
                      type="password"
                      value={password}
                    />
                  </div>

                  <Button className="w-full" size="lg" type="submit">
                    Sign in
                  </Button>
                </form>

                {error ? (
                  <p className="mt-component rounded-control bg-destructive/10 px-control py-item text-ui text-destructive">
                    {error}
                  </p>
                ) : null}

                <p className="mt-card text-center text-ui text-text-secondary">
                  Have an invitation?{' '}
                  <Link className="font-medium text-brand no-underline hover:text-brand/80" to="/accept-invite">
                    Accept invite
                  </Link>
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
