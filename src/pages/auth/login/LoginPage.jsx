import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, CardContent, Input, PrimitiveCard as Card } from '@/shared/ui'

import { getPostLoginHref } from '../../../app/routing/postLoginRedirect'
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

      navigate(getPostLoginHref({
        nextHref: searchParams.get('next'),
        viewer,
      }), { replace: true })
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
      <div className="mx-auto w-full max-w-modal-lg">
        <Card className="w-full overflow-hidden border border-block-border bg-block p-0 py-0">
          <CardContent className="grid gap-0 p-0 lg:min-h-[560px] lg:grid-cols-2">
            <section className="flex min-w-0 flex-col justify-between gap-panel border-separator bg-surface-raised p-panel lg:border-r lg:p-page">
              <div className="grid gap-layout">
                <BrandLogo href="/" size="sm" variant="static" />

                <div className="max-w-inspector">
                  <p className="text-ui font-semibold text-brand">CLIENT DASHBOARD</p>
                  <h1 className="mt-component text-display text-text-primary">
                    <span className="block">Your dashboard</span>
                    <span className="block">is ready.</span>
                  </h1>
                  <p className="mt-component text-body text-text-secondary">
                    Sign in to see the latest results we've shared with you.
                  </p>
                </div>
              </div>

              <div className="grid gap-component">
                <div className="w-full max-w-inspector rounded-block bg-block p-card shadow-block">
                  <div className="flex items-center gap-component">
                    <span className="flex size-control-large shrink-0 items-center justify-center rounded-control bg-success-muted text-success-foreground">
                      <Icon name="shieldCheck" size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-ui font-semibold text-text-primary">Private by invite</p>
                      <p className="text-ui text-text-secondary">Only people with access can view this dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex items-center p-panel lg:p-page">
              <div className="mx-auto w-full max-w-form">
                <div>
                  <p className="text-ui text-brand">Welcome back</p>
                  <h2 className="mt-item text-display text-text-primary">Sign in</h2>
                  <p className="mt-item text-body text-text-secondary">
                    Use your username and password to continue.
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
                    Accept
                  </Link>
                  {' '}it
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
