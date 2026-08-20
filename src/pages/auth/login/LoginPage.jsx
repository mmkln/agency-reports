import { useNavigate, useSearchParams } from 'react-router-dom'

import { CardContent, PrimitiveCard as Card } from '@/shared/ui'

import { getPostLoginHref } from '../../../app/routing/postLoginRedirect'
import { useAuth } from '../../../app/providers/auth/useAuth'
import { AuthLoginPanel } from '../../../features/auth-login'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { BrandLogo } from '../../../shared/ui'

const DEFAULT_EMAIL = ''

export function LoginPage({ onAuthChange }) {
  const auth = useAuth()
  const authClient = auth.authClient
  const resolvedOnAuthChange = onAuthChange ?? auth.onAuthChange
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  function handleAuthenticated(viewer) {
    resolvedOnAuthChange?.()
    toast.success('Signed in', `Welcome back, ${viewer.name}.`)

    navigate(getPostLoginHref({
      nextHref: searchParams.get('next'),
      viewer,
    }), { replace: true })
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
                <AuthLoginPanel
                  initialEmail={DEFAULT_EMAIL}
                  onAuthenticated={handleAuthenticated}
                  onEmailCodeRequest={authClient.requestEmailLoginCode}
                  onEmailCodeSignIn={auth.onEmailCodeSignIn ?? authClient.signInWithEmailCode}
                  onError={(caughtError) => {
                    toast.error('Sign in failed', caughtError.message)
                  }}
                  onPasswordSignIn={auth.onSignIn ?? authClient.signInWithEmail}
                />
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
