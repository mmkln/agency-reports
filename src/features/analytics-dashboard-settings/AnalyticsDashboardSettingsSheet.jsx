import { useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  ErrorBlock,
  MultiSelect,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/shared/ui'

import { useAnalyticsDashboardSettings } from './useAnalyticsDashboardSettings'

const LIFECYCLE_GROUPS = [
  {
    description: 'Leads with a current appointment outcome.',
    key: 'booked',
    label: 'Booked',
  },
  {
    description: 'Leads still receiving active follow-up.',
    key: 'active_nurture',
    label: 'Active nurture',
  },
  {
    description: 'Leads deferred into a longer follow-up cycle.',
    key: 'long_term_nurture',
    label: 'Long-term nurture',
  },
  {
    description: 'Leads no longer being pursued.',
    key: 'closed_out',
    label: 'Closed out',
  },
]

function LifecycleMappingField({ availableStages, group, lifecycleStageIds, onChange }) {
  const selectedByOtherGroups = new Set(
    Object.entries(lifecycleStageIds)
      .filter(([key]) => key !== group.key)
      .flatMap(([, stageIds]) => stageIds),
  )
  const options = availableStages.filter(
    (stage) => !selectedByOtherGroups.has(stage.value) || lifecycleStageIds[group.key].includes(stage.value),
  )

  return (
    <div className="grid gap-tag">
      <div>
        <p className="text-ui font-medium text-text-primary">{group.label}</p>
        <p className="mt-micro text-label text-text-muted">{group.description}</p>
      </div>
      <MultiSelect
        emptyText="Select a lead pipeline first."
        onChange={(stageIds) => onChange(group.key, stageIds)}
        options={options}
        placeholder="Choose pipeline stages"
        value={lifecycleStageIds[group.key]}
      />
    </div>
  )
}

export function AnalyticsDashboardSettingsSheet({
  dashboardKey,
  onSaved,
  runtime,
  workspaceId,
}) {
  const [open, setOpen] = useState(false)
  const settings = useAnalyticsDashboardSettings({ dashboardKey, open, runtime, workspaceId })
  const isBusy = settings.status === 'loading' || settings.status === 'saving'
  const pipelineOptions = settings.pipelineOptions.map((pipeline) => ({
    label: pipeline.label,
    value: pipeline.id,
  }))

  const handleSave = async () => {
    const saved = await settings.save()
    if (saved) {
      setOpen(false)
      await onSaved?.()
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} size="sm" type="button" variant="secondary">
        <Icon name="settings" size={14} />
        Report settings
      </Button>
      <SheetContent className="data-[side=right]:sm:max-w-sheet-md">
        <SheetHeader>
          <SheetTitle>Lead report settings</SheetTitle>
          <SheetDescription>
            Define the lead cohort once, then use it consistently across every report section.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 content-start gap-card overflow-y-auto px-panel py-card">
          {settings.status === 'loading' ? (
            <div className="grid gap-component">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          ) : (
            <>
              {settings.error ? <ErrorBlock>{settings.error}</ErrorBlock> : null}

              <section className="grid gap-item">
                <div>
                  <h3 className="text-ui font-semibold text-text-primary">Lead cohort</h3>
                  <p className="mt-micro text-label text-text-muted">
                    Only opportunities created in these pipelines enter the report.
                  </p>
                </div>
                <MultiSelect
                  emptyText="No synced pipelines are available."
                  onChange={settings.setPipelineIds}
                  options={pipelineOptions}
                  placeholder="Choose lead pipelines"
                  value={settings.pipelineIds}
                />
              </section>

              <section className="grid gap-component">
                <div>
                  <h3 className="text-ui font-semibold text-text-primary">Lifecycle mapping</h3>
                  <p className="mt-micro text-label text-text-muted">
                    Map each selected pipeline stage to one reporting status.
                  </p>
                </div>
                {LIFECYCLE_GROUPS.map((group) => (
                  <LifecycleMappingField
                    availableStages={settings.availableStages}
                    group={group}
                    key={group.key}
                    lifecycleStageIds={settings.lifecycleStageIds}
                    onChange={settings.setLifecycleStageIds}
                  />
                ))}
              </section>
            </>
          )}
        </div>

        <SheetFooter className="sm:flex-row sm:justify-end">
          <Button disabled={isBusy} onClick={() => setOpen(false)} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={isBusy || settings.pipelineIds.length === 0}
            onClick={handleSave}
            type="button"
          >
            {settings.status === 'saving' ? 'Saving' : 'Save and refresh'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
