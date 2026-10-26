import { useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  ErrorBlock,
  FullscreenDialog,
  FullscreenDialogBody,
  FullscreenDialogContent,
  FullscreenDialogFooter,
  FullscreenDialogHeader,
  FullscreenDialogTrigger,
  Skeleton,
} from '@/shared/ui'

import { DashboardSectionsSection } from './DashboardSectionsSection'
import { DashboardSourceSummary } from './DashboardSourceSummary'
import { LeadCohortSection } from './LeadCohortSection'
import { LifecycleStageMappingSection } from './LifecycleStageMappingSection'
import { useAnalyticsDashboardSettings } from './useAnalyticsDashboardSettings'

export function AnalyticsDashboardSettingsDialog({
  dashboardKey,
  onOpenChange,
  onSaved,
  open,
  runtime,
  workspaceId,
}) {
  const [localOpen, setLocalOpen] = useState(false)
  const isOpen = open ?? localOpen
  const setOpen = onOpenChange ?? setLocalOpen
  const settings = useAnalyticsDashboardSettings({
    dashboardKey,
    open: isOpen,
    runtime,
    workspaceId,
  })
  const isBusy = settings.status === 'loading' || settings.status === 'saving'

  const handleSave = async () => {
    const saved = await settings.save()
    if (!saved) return
    setOpen(false)
    await onSaved?.()
  }

  return (
    <FullscreenDialog onOpenChange={setOpen} open={isOpen}>
      <FullscreenDialogTrigger asChild>
        <Button size="sm" type="button" variant="secondary">
          <Icon name="settings" size={14} />
          Report settings
        </Button>
      </FullscreenDialogTrigger>
      <FullscreenDialogContent>
        <FullscreenDialogHeader
          description="Configure the cohort, lifecycle interpretation, and visible report content."
          title="Lead report settings"
        />

        <FullscreenDialogBody>
          {settings.status === 'loading' ? (
            <div className="grid gap-component">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          ) : (
            <div className="grid gap-card xl:grid-cols-settings">
              <div className="grid content-start gap-card">
                {settings.error ? <ErrorBlock>{settings.error}</ErrorBlock> : null}
                <LeadCohortSection
                  onChange={settings.setPipelineIds}
                  pipelineIds={settings.pipelineIds}
                  pipelineOptions={settings.pipelineOptions}
                />
                <LifecycleStageMappingSection
                  onChange={settings.setStageAssignment}
                  selectedPipelines={settings.selectedPipelines}
                  stageAssignments={settings.stageAssignments}
                  unmappedStageCount={settings.unmappedStageCount}
                />
              </div>
              <aside className="grid content-start gap-card">
                <DashboardSourceSummary sourceConnection={settings.sourceConnection} />
                <DashboardSectionsSection
                  onMetricVisibilityChange={(itemId, isVisible) => (
                    settings.setVisibility('overviewMetrics', itemId, isVisible)
                  )}
                  onSectionVisibilityChange={(itemId, isVisible) => (
                    settings.setVisibility('sections', itemId, isVisible)
                  )}
                  overviewMetrics={settings.overviewMetrics}
                  sections={settings.sections}
                />
              </aside>
            </div>
          )}
        </FullscreenDialogBody>

        <FullscreenDialogFooter>
          <Button disabled={isBusy} onClick={() => setOpen(false)} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={isBusy || settings.pipelineIds.length === 0 || settings.visibleItemCount === 0}
            onClick={handleSave}
            type="button"
          >
            {settings.status === 'saving' ? 'Saving' : 'Save'}
          </Button>
        </FullscreenDialogFooter>
      </FullscreenDialogContent>
    </FullscreenDialog>
  )
}
