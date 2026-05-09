import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {
  authenticateWithEmail,
  getHomeHrefForViewer,
  listLoginProfiles,
} from '../../../domain/services/authService'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'

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
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50"
      onClick={() => onClick(profile.email)}
      type="button"
    >
      <span className="block font-semibold text-slate-900">{profile.name}</span>
      <span className="block text-xs text-slate-500">{getRoleLabel(profile.role)}</span>
    </button>
  )
}

export function LoginPage({ onAuthChange, runtime }) {
  const toast = useToast()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [error, setError] = useState('')
  const loginProfiles = useMemo(
    () => listLoginProfiles({ repositories: runtime.repositories }),
    [runtime.repositories],
  )

  function signIn(nextEmail) {
    try {
      const viewer = authenticateWithEmail({
        email: nextEmail,
        repositories: runtime.repositories,
      })

      onAuthChange?.()
      toast.success('Signed in', `Welcome back, ${viewer.name}.`)
      window.location.hash = getHomeHrefForViewer(viewer).replace('#', '')
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Sign in failed', caughtError.message)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn(email)
  }

  return (
    <main className="min-h-screen bg-public-background px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-md border-indigo-100 bg-white shadow-[0_24px_70px_rgba(90,69,255,0.08)]">
          <CardContent className="p-8">
            <BrandLogo href="#landing" variant="static" />

            <div className="mt-10">
              <p className="text-sm font-semibold text-brand">Welcome back</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">Sign in to your account</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use your agency email to continue to the client portal workspace.
              </p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Email address</span>
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
                <span className="text-sm font-medium text-slate-700">Password</span>
                <Input
                  autoComplete="current-password"
                  defaultValue="password"
                  minLength={6}
                  name="password"
                  required
                  type="password"
                />
              </label>

              <Button className="w-full" size="lg" type="submit">
                Sign in
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo users</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {loginProfiles.map((profile) => (
                  <SignInButton key={profile.id} onClick={signIn} profile={profile} />
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Have an invitation?{' '}
              <a className="font-medium text-brand no-underline hover:text-brand/80" href="#accept-invite">
                Accept invite
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
