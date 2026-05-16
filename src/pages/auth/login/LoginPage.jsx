import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button, CardContent, Input, PrimitiveCard as Card } from '@/shared/ui'

import {
  authenticateWithEmail,
  DEMO_AUTH_PASSWORD,
  getHomeHrefForViewer,
  listLoginProfiles,
} from '../../../domain/services/authService'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'
import { useAuth } from '../../../app/providers/auth/useAuth'

const DEFAULT_EMAIL = 'admin@growthlab.example'

function getRoleLabel(role) {
  return role
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function SignInButton({ onClick, profile }) {
  return (
    <button
      className="rounded-control bg-control px-control py-item text-left text-ui transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover"
      onClick={() => onClick(profile.email, DEMO_AUTH_PASSWORD)}
      type="button"
    >
      <span className="block font-semibold text-text-primary">{profile.name}</span>
      <span className="block text-label font-normal text-text-secondary">{getRoleLabel(profile.role)}</span>
    </button>
  )
}

export function LoginPage({ onAuthChange, runtime }) {
  const auth = useAuth()
  const resolvedRuntime = runtime ?? auth.runtime
  const resolvedOnAuthChange = onAuthChange ?? auth.onAuthChange
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEMO_AUTH_PASSWORD)
  const [error, setError] = useState('')
  const loginProfiles = useMemo(
    () => listLoginProfiles({ repositories: resolvedRuntime.repositories }),
    [resolvedRuntime.repositories],
  )

  function signIn(nextEmail, nextPassword) {
    try {
      const viewer = authenticateWithEmail({
        email: nextEmail,
        password: nextPassword,
        repositories: resolvedRuntime.repositories,
      })

      resolvedOnAuthChange?.()
      toast.success('Signed in', `Welcome back, ${viewer.name}.`)
      navigate(getHomeHrefForViewer(viewer), { replace: true })
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Sign in failed', caughtError.message)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn(email, password)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-form bg-material-vibrant shadow-premium backdrop-blur-2xl">
          <CardContent className="p-8">
            <BrandLogo href="/" variant="static" />

            <div className="mt-10">
              <p className="text-ui text-brand">Welcome back</p>
              <h1 className="mt-2 text-display text-text-primary">Sign in to your account</h1>
              <p className="mt-2 text-body text-text-secondary">
                Use your agency email to continue to the client portal workspace.
              </p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-ui text-text-secondary">Email address</span>
                <Input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-ui text-text-secondary">Password</span>
                <Input
                  autoComplete="current-password"
                  minLength={6}
                  name="password"
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  required
                  type="password"
                  value={password}
                />
                <span className="text-label font-normal text-text-muted">Demo password: {DEMO_AUTH_PASSWORD}</span>
              </label>

              <Button className="w-full" size="lg" type="submit">
                Sign in
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-control bg-destructive/10 px-control py-item text-ui text-destructive">
                {error}
              </p>
            ) : null}

            <div className="mt-6 grid gap-2">
              <p className="text-label uppercase text-text-muted">Demo users</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {loginProfiles.map((profile) => (
                  <SignInButton key={profile.id} onClick={signIn} profile={profile} />
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-ui text-text-secondary">
              Have an invitation?{' '}
              <Link className="font-medium text-brand no-underline hover:text-brand/80" to="/accept-invite">
                Accept invite
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
