import { PanelHeader } from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'

export function AnalyticsWidgetHeader({
  explanationEditor,
  explanationKey,
  explanations,
  title,
  trailing,
}) {
  return (
    <PanelHeader>
      <div className="flex min-w-0 items-center justify-between gap-component">
        <div className="flex min-w-0 items-center gap-tag">
          <h2 className="truncate text-heading text-text-primary">{title}</h2>
          <AnalyticsExplanationPopover
            explanationEditor={explanationEditor}
            explanationKey={explanationKey}
            explanations={explanations}
          />
        </div>
        {trailing ? (
          <span className="shrink-0 text-label font-medium text-text-muted">{trailing}</span>
        ) : null}
      </div>
    </PanelHeader>
  )
}
