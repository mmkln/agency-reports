import {
  Button,
  EmptyState,
  ErrorBlock,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/shared/ui'

import { useAnalyticsDashboardProvisioning } from './useAnalyticsDashboardProvisioning'

function ManagerSetupState({ dashboardKey, onCreated, runtime, workspaceId }) {
  const provisioning = useAnalyticsDashboardProvisioning({ dashboardKey, runtime, workspaceId })

  if (provisioning.status === 'loading') {
    return <Skeleton className="h-48 w-full" />
  }

  const handleCreate = async () => {
    const dashboard = await provisioning.create()
    if (dashboard) await onCreated?.(dashboard)
  }

  const hasSetupOptions = Boolean(
    provisioning.definition && provisioning.sourceConnections.length,
  )

  return (
    <EmptyState
      action={(
        <div className="grid w-full max-w-md gap-control">
          {provisioning.error ? <ErrorBlock>{provisioning.error}</ErrorBlock> : null}
          {hasSetupOptions ? (
            <div className="flex flex-col gap-control sm:flex-row">
              <RadixSelect
                onValueChange={provisioning.setSourceConnectionId}
                value={provisioning.sourceConnectionId}
              >
                <SelectTrigger aria-label="GHL source connection" className="sm:min-w-64">
                  <SelectValue placeholder="Choose GHL connection" />
                </SelectTrigger>
                <SelectContent>
                  {provisioning.sourceConnections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.external_account_id || 'GHL connection'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </RadixSelect>
              <Button
                disabled={provisioning.status === 'creating'}
                onClick={handleCreate}
                type="button"
              >
                {provisioning.status === 'creating' ? 'Creating' : 'Create report'}
              </Button>
            </div>
          ) : null}
        </div>
      )}
      description={hasSetupOptions
        ? 'Choose the active GHL location that will supply this report.'
        : 'Connect an active GHL location in Data before creating this report.'}
      iconName="barChart"
      title="Set up Weekly Lead Report"
    />
  )
}

export function AnalyticsDashboardSetupState({
  canManage,
  dashboardKey,
  onCreated,
  runtime,
  workspaceId,
}) {
  if (!canManage) {
    return (
      <EmptyState
        description="A workspace manager needs to connect and configure this report."
        iconName="barChart"
        title="This report is not configured yet"
      />
    )
  }

  return (
    <ManagerSetupState
      dashboardKey={dashboardKey}
      onCreated={onCreated}
      runtime={runtime}
      workspaceId={workspaceId}
    />
  )
}
