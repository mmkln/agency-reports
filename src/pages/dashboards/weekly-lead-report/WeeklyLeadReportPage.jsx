import { useState } from 'react'

import { useAnalyticsDashboardReadModel } from '@/features/analytics-dashboard-data'
import { useAnalyticsDashboardExplanationActions } from '@/features/analytics-dashboard-explanation'
import {
  AnalyticsDashboardPeriodPicker,
  useAnalyticsDashboardPeriodSelection,
} from '@/features/analytics-dashboard-period-selection'
import { AnalyticsDashboardSetupState } from '@/features/analytics-dashboard-provisioning'
import { AnalyticsDashboardSettingsDialog } from '@/features/analytics-dashboard-settings'
import { WORKSPACE_CAPABILITIES } from '@/entities/workspace-membership'
import {
  AnalyticsDashboardRenderer,
  WeeklyLeadReportContextToolbar,
} from '@/widgets/analytics-dashboard'
import {
  Button,
  DashboardSettingsMenu,
  EmptyState,
  PageShell,
  ResourceState,
  Skeleton,
} from '@/shared/ui'

const DASHBOARD_KEY = 'weekly-lead-report'

export function WeeklyLeadReportPage({ routeParams = {}, runtime }) {
  const workspaceId = routeParams.workspaceId ?? routeParams.clientId ?? runtime.defaultClientId ?? runtime.viewer?.activeWorkspaceId
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState('data')
  const periodSelection = useAnalyticsDashboardPeriodSelection({
    dashboardKey: DASHBOARD_KEY,
    workspaceId,
  })
  const readModel = useAnalyticsDashboardReadModel({
    dashboardKey: DASHBOARD_KEY,
    periodKey: periodSelection.periodKey,
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

  function openSettings(section) {
    setSettingsSection(section)
    setSettingsOpen(true)
  }

  function calculatePeriod(periodKey) {
    periodSelection.selectPeriod(periodKey)
    return readModel.runRefresh(periodKey)
  }

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
            setSettingsSection('data')
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
        canRefresh={dashboard.permissions?.canRefresh === true}
        calculatedAt={dashboard.calculatedAt}
        calculationStatus={dashboard.calculationStatus}
        isRefreshing={readModel.isRefreshing}
        onRefresh={readModel.runRefresh}
        periodSelector={(
          <AnalyticsDashboardPeriodPicker
            canCalculate={dashboard.permissions?.canRefresh === true}
            isRefreshing={readModel.isRefreshing}
            onCalculate={calculatePeriod}
            onSelect={periodSelection.selectPeriod}
            periodCatalog={dashboard.periodCatalog}
            selectedPeriod={dashboard.period}
          />
        )}
        refresh={readModel.refresh}
        refreshError={readModel.refreshError}
        settingsAction={dashboard.permissions?.canManageSettings ? (
          <DashboardSettingsMenu
            items={[
              {
                description: 'Visible metrics and report sections',
                iconName: 'layoutDashboard',
                id: 'customize-dashboard',
                label: 'Customize dashboard',
                onSelect: () => openSettings('display'),
              },
              {
                description: 'Lead cohort, source tags and lifecycle mapping',
                iconName: 'database',
                id: 'configure-report',
                label: 'Configure data and lifecycle',
                onSelect: () => openSettings('data'),
              },
            ]}
          />
        ) : null}
        title={dashboard.dashboard.title}
      />

      {dashboard.status === 'not_calculated' ? (
        <EmptyState
          action={dashboard.permissions?.canRefresh ? (
            <Button disabled={readModel.isRefreshing} onClick={readModel.runRefresh} type="button">
              Calculate report
            </Button>
          ) : null}
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

      {dashboard.permissions?.canManageSettings ? (
        <AnalyticsDashboardSettingsDialog
          dashboardKey={DASHBOARD_KEY}
          initialSection={settingsSection}
          onOpenChange={setSettingsOpen}
          onSaved={readModel.reload}
          open={settingsOpen}
          runtime={runtime}
          workspaceId={workspaceId}
        />
      ) : null}
    </PageShell>
  )
}
