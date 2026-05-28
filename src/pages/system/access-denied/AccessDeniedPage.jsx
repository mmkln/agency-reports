import { Button, CardContent, PrimitiveCard as Card } from '@/shared/ui'
import { Link } from 'react-router-dom'

import { getHomeHrefForViewer } from '../../../domain/services/viewerHomeService'
import { Icon } from '../../../shared/icons'
import { BrandLogo } from '../../../shared/ui'
import { useAuth } from '../../../app/providers/auth/useAuth'

export function AccessDeniedPage({ runtime }) {
  const auth = useAuth()
  const resolvedRuntime = runtime ?? auth.runtime
  const homeHref = getHomeHrefForViewer(resolvedRuntime.viewer)

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-10 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full border-control-border bg-block shadow-none">
          <CardContent className="p-10 text-center">
            <div className="flex justify-center">
              <BrandLogo href={homeHref} variant="static" />
            </div>
            <div className="mx-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Icon name="shieldCheck" size={36} />
            </div>
            <h1 className="mt-6 text-display text-text-primary">
              Access denied
            </h1>
            <p className="mx-auto mt-3 max-w-md text-body text-text-muted">
              Your current role or client membership does not allow access to this workspace.
              Check the link or return to your portal home.
            </p>
            <Button asChild className="mt-7">
              <Link to={homeHref}>Return to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
