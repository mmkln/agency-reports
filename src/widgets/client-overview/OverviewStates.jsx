import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
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
          You do not have permission to view this workspace. Check the link or contact your workspace contact.
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
    <EmptyState
      className="items-center py-12 text-center sm:py-16"
      description="Your workspace has been created. The team is still adding the first projects, tasks, dashboard, and report. This page will fill in as soon as the first portal information is published."
      iconName="database"
      title={`Welcome, ${client.name}`}
    />
  )
}

export function LoadingOverviewState() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="grid gap-6">
        <Panel>
          <PanelHeader divided>
            <div className="grid gap-tag">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader divided>
            <div className="grid gap-tag">
              <Skeleton className="h-5 w-40" />
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-4/5" />
          </PanelBody>
        </Panel>
      </div>
      <aside className="grid gap-6">
        <Panel>
          <PanelHeader divided>
            <div className="grid gap-tag">
              <Skeleton className="h-5 w-36" />
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader divided>
            <div className="grid gap-tag">
              <Skeleton className="h-5 w-44" />
            </div>
          </PanelHeader>
          <PanelBody>
            <Skeleton className="h-28 w-full" />
          </PanelBody>
        </Panel>
      </aside>
    </div>
  )
}
