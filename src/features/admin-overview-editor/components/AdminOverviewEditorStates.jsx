import { Link } from 'react-router-dom'

import {
  Button,
  EmptyState,
  PageShell,
  Panel,
  PanelBody,
  Skeleton,
} from '@/shared/ui'

export function AdminOverviewEditorErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Panel>
        <PanelBody className="flex min-h-[280px] items-center justify-center">
          <EmptyState
            action={(
              <Button asChild variant="outline">
                <Link to="/admin/clients">Back to clients</Link>
              </Button>
            )}
            className="mx-auto max-w-md items-center text-center"
            description={message}
            iconName="shieldCheck"
            title="Client overview unavailable"
          />
        </PanelBody>
      </Panel>
    </PageShell>
  )
}

export function AdminOverviewEditorLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Panel>
        <PanelBody className="flex min-h-[260px] items-center justify-center">
          <div className="grid w-full max-w-md gap-component">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </PanelBody>
      </Panel>
    </PageShell>
  )
}
