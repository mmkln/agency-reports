import { useState } from 'react'

import { useAnalyticsDashboardReadModel } from '@/features/analytics-dashboard-data'
import { useAnalyticsDashboardExplanationActions } from '@/features/analytics-dashboard-explanation'
import { AnalyticsDashboardSetupState } from '@/features/analytics-dashboard-provisioning'
import { AnalyticsDashboardSettingsDialog } from '@/features/analytics-dashboard-settings'
import { WORKSPACE_CAPABILITIES } from '@/entities/workspace-membership'
import {
  AnalyticsDashboardRenderer,
  WeeklyLeadReportContextToolbar,
} from '@/widgets/analytics-dashboard'
import {
  Button,
  EmptyState,
  PageShell,
  ResourceState,
  Skeleton,
} from '@/shared/ui'

const DASHBOARD_KEY = 'weekly-lead-report'

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultPeriodEnd() {
  const date = new Date()
  date.setDate(date.getDate() - date.getDay())
  return toIsoDate(date)
}

export function WeeklyLeadReportPage({ routeParams = {}, runtime }) {
  const workspaceId = routeParams.workspaceId ?? routeParams.clientId ?? runtime.defaultClientId ?? runtime.viewer?.activeWorkspaceId
  const [periodType, setPeriodType] = useState('week')
  const [periodEnd, setPeriodEnd] = useState(getDefaultPeriodEnd)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const readModel = useAnalyticsDashboardReadModel({
    dashboardKey: DASHBOARD_KEY,
    periodEnd,
    periodType,
    runtime,
    workspaceId,
  })
  const canManageSettings = runtime.viewer?.capabilities?.includes(
    WORKSPACE_CAPABILITIES.MANAGE_INTEGRATIONS,
  )
  const explanationActions = useAnalyticsDashboardExplanationActions({
    apiClient: runtime.apiClient,
    dashboardKey: DASHBOARD_KEY,
    onSaved: readModel.reload,
    workspaceId,
  })
  if (readModel.status === 'loading') {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="min-h-96 w-full" />
      </PageShell>
    )
  }

  if (readModel.isUnconfigured) {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <AnalyticsDashboardSetupState
          canManage={canManageSettings}
          dashboardKey={DASHBOARD_KEY}
          onCreated={async () => {
            await readModel.reload()
            setSettingsOpen(true)
          }}
          runtime={runtime}
          workspaceId={workspaceId}
        />
      </PageShell>
    )
  }

  if (readModel.status === 'error') {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <ResourceState errorInfo={readModel.errorInfo} onRetry={readModel.reload} />
      </PageShell>
    )
  }

  const dashboard = readModel.dashboard

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <WeeklyLeadReportContextToolbar
        calculatedAt={dashboard.calculatedAt}
        isRefreshing={readModel.isRefreshing}
        onPeriodEndChange={setPeriodEnd}
        onPeriodTypeChange={setPeriodType}
        onRefresh={readModel.runRefresh}
        period={dashboard.period}
        periodEnd={periodEnd}
        periodType={periodType}
        refresh={readModel.refresh}
        refreshError={readModel.refreshError}
        settingsAction={dashboard.permissions?.canManageSettings ? (
          <AnalyticsDashboardSettingsDialog
            dashboardKey={DASHBOARD_KEY}
            onOpenChange={setSettingsOpen}
            onSaved={async ({ refreshRequired }) => {
              await readModel.reload()
              if (refreshRequired) await readModel.runRefresh()
            }}
            open={settingsOpen}
            runtime={runtime}
            workspaceId={workspaceId}
          />
        ) : null}
        title={dashboard.dashboard.title}
      />

      {dashboard.status === 'not_calculated' ? (
        <EmptyState
          action={(
            <Button disabled={readModel.isRefreshing} onClick={readModel.runRefresh} type="button">
              Calculate report
            </Button>
          )}
          description="Sync source data and calculate this reporting period."
          iconName="barChart"
          title="This report has not been calculated yet"
        />
      ) : (
        <AnalyticsDashboardRenderer
          explanationEditor={{
            ...explanationActions,
            canEdit: dashboard.permissions?.canEditExplanations === true,
          }}
          explanations={dashboard.explanations}
          period={dashboard.period}
          runtime={runtime}
          widgets={dashboard.widgets}
        />
      )}
    </PageShell>
  )
}
