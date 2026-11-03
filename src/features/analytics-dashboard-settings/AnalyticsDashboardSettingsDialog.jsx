import { useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  ErrorBlock,
  FilterTabs,
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
import { LeadSourceMappingSection } from './LeadSourceMappingSection'
import { LifecycleStageMappingSection } from './LifecycleStageMappingSection'
import { SequenceTagsSection } from './SequenceTagsSection'
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
  const [activeSection, setActiveSection] = useState('data')
  const isOpen = open ?? localOpen
  const setOpen = onOpenChange ?? setLocalOpen
  const settings = useAnalyticsDashboardSettings({
    dashboardKey,
    open: isOpen,
    runtime,
    workspaceId,
  })
  const isBusy = settings.status === 'loading' || settings.status === 'saving'
  const isInSequenceVisible = settings.overviewMetrics.some(
    (metric) => metric.id === 'leads.in_sequence' && metric.isVisible,
  )
  const hasEmptySourceMapping = settings.sourceMappings.some(
    (mapping) => mapping.tagNames.length === 0,
  )
  const sectionItems = [
    { label: 'Data setup', value: 'data' },
    {
      count: settings.unmappedStageCount || undefined,
      label: 'Lifecycle',
      value: 'lifecycle',
    },
    { label: 'Display', value: 'display' },
  ]

  const handleSave = async () => {
    const saved = await settings.save()
    if (!saved) return
    setOpen(false)
    await onSaved?.(saved)
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
            <div className="grid gap-card">
              <FilterTabs
                ariaLabel="Lead report settings section"
                items={sectionItems}
                onValueChange={setActiveSection}
                value={activeSection}
              />
              {settings.error ? <ErrorBlock>{settings.error}</ErrorBlock> : null}

              {activeSection === 'data' ? (
                <div className="grid gap-card xl:grid-cols-settings">
                  <div className="grid min-w-0 content-start gap-card">
                    <LeadCohortSection
                      onChange={settings.setPipelineIds}
                      pipelineIds={settings.pipelineIds}
                      pipelineOptions={settings.pipelineOptions}
                    />
                    <LeadSourceMappingSection
                      mappings={settings.sourceMappings}
                      onChange={settings.setSourceMappingTagNames}
                      tagOptions={settings.tagOptions}
                    />
                    <SequenceTagsSection
                      onChange={settings.setSequenceActiveTagNames}
                      tagNames={settings.sequenceActiveTagNames}
                      tagOptions={settings.tagOptions}
                    />
                  </div>
                  <aside className="grid min-w-0 content-start gap-card">
                    <DashboardSourceSummary sourceConnection={settings.sourceConnection} />
                  </aside>
                </div>
              ) : null}

              {activeSection === 'lifecycle' ? (
                <LifecycleStageMappingSection
                  onChange={settings.setStageAssignment}
                  selectedPipelines={settings.selectedPipelines}
                  stageAssignments={settings.stageAssignments}
                  unmappedStageCount={settings.unmappedStageCount}
                />
              ) : null}

              {activeSection === 'display' ? (
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
              ) : null}
            </div>
          )}
        </FullscreenDialogBody>

        <FullscreenDialogFooter>
          <Button disabled={isBusy} onClick={() => setOpen(false)} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={
              isBusy
              || settings.pipelineIds.length === 0
              || hasEmptySourceMapping
              || (isInSequenceVisible && settings.sequenceActiveTagNames.length === 0)
              || settings.visibleItemCount === 0
            }
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
