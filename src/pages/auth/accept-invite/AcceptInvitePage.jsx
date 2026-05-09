import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {
  acceptClientInvitation,
  getClientInvitationByToken,
} from '../../../domain/services/clientInviteService'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'

function createUuid() {
  return crypto.randomUUID()
}

export function AcceptInvitePage({ onAuthChange, routeParams, runtime }) {
  const toast = useToast()
  const token = routeParams.token ?? ''
  const invitationContext = useMemo(() => {
    if (!token) {
      return null
    }

    try {
      return getClientInvitationByToken({
        repositories: runtime.repositories,
        token,
      })
    } catch {
      return null
    }
  }, [runtime.repositories, token])
  const [email, setEmail] = useState(invitationContext?.invitation.email ?? '')
  const [name, setName] = useState(invitationContext?.invitation.name ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    try {
      const result = acceptClientInvitation({
        email,
        idGenerator: createUuid,
        name,
        repositories: runtime.repositories,
        token,
      })

      onAuthChange?.()
      toast.success('Invitation accepted', `You now have access to ${result.client.name}.`)
      window.location.hash = `client-overview?clientId=${result.client.id}`
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Invite was not accepted', caughtError.message)
    }
  }

  return (
    <main className="min-h-screen bg-public-background px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-md border-indigo-100 bg-white shadow-[0_24px_70px_rgba(90,69,255,0.08)]">
          <CardContent className="p-8">
            <BrandLogo href="#landing" variant="static" />

            <div className="mt-10">
              <p className="text-sm font-semibold text-brand">Client portal invite</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">Accept your invitation</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Confirm your email and name to access your client status hub.
              </p>
            </div>

            {invitationContext ? (
              <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-3 text-sm text-indigo-700">
                You were invited to {invitationContext.client.name}.
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                Add a valid invite token to the URL. Example: #accept-invite?token=invite-token
              </div>
            )}

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <Input
                  autoComplete="name"
                  minLength={2}
                  name="name"
                  onChange={(event) => {
                    setName(event.target.value)
                    setError('')
                  }}
                  required
                  type="text"
                  value={name}
                />
              </label>

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

              <Button className="w-full" disabled={!invitationContext} size="lg" type="submit">
                Accept invite
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have access?{' '}
              <a className="font-medium text-brand no-underline hover:text-brand/80" href="#login">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
