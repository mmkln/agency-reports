import { Link } from 'react-router-dom'

import {
  Button,
  CardContent,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
  Skeleton,
} from '@/shared/ui'

import { Icon } from '@/shared/icons'

export function AccessDeniedState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center px-4 py-14">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon name="shieldCheck" size={34} />
        </div>
        <h1 className="mt-6 text-display text-text-primary">Access denied</h1>
        <p className="mt-3 text-body text-text-muted">
          You do not have permission to view this client portal. Check the link or contact your agency manager.
        </p>
        <Button asChild className="mt-6" size="lg" variant="secondary">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  )
}

export function EmptyOverviewState({ client }) {
  return (
    <Card className="border-dashed border-border-strong bg-block shadow-none">
      <CardContent className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-block border border-control-border bg-surface-subtle text-text-muted">
            <Icon name="database" size={28} />
          </div>
          <h2 className="mt-6 text-heading text-text-primary">Welcome, {client.name}</h2>
          <p className="mt-3 text-body text-text-muted">
            Your client portal has been created. The agency team is still adding the first projects,
            tasks, dashboard, and report. This page will fill in as soon as the first client-facing
            information is published.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingOverviewState() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="grid gap-6">
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-4/5" />
          </CardContent>
        </Card>
      </div>
      <aside className="grid gap-6">
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
        <Card className="border-control-border bg-block py-0 shadow-none">
          <CardHeader className="border-b border-separator bg-surface-subtle py-4">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="py-4">
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
