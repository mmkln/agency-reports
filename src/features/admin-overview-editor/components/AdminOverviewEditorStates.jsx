import { Link } from 'react-router-dom'

import {
  Button,
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function AdminOverviewEditorErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="flex min-h-[280px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Icon name="shieldCheck" size={30} />
            </div>
            <h2 className="mt-5 text-heading text-text-primary">Client overview unavailable</h2>
            <p className="mt-2 text-body text-text-muted">{message}</p>
            <Button asChild className="mt-5" variant="outline">
              <Link to="/admin/clients">Back to clients</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function AdminOverviewEditorLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    </PageShell>
  )
}
