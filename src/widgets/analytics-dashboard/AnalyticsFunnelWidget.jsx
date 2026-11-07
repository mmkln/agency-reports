import { Panel, PanelBody } from '@/shared/ui'

import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'

export function AnalyticsFunnelWidget({
  data,
  explanationEditor,
  explanations,
  title,
}) {
  const stages = data?.stages ?? []
  const firstValue = stages[0]?.value ?? 0

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={data?.explanation_key ?? data?.key}
        explanations={explanations}
        title={title}
      />
      <PanelBody>
        <div className="grid gap-component md:grid-cols-3">
          {stages.map((stage, index) => {
            const rate = index === 0 ? 100 : firstValue ? Math.round((stage.value / firstValue) * 100) : 0

            return (
              <div className="grid min-h-32 content-between gap-control rounded-control bg-block-subtle p-component" key={stage.key}>
                <p className="text-label font-normal text-text-secondary">{stage.label}</p>
                <div>
                  <p className="text-data tabular-nums text-text-primary">{Number(stage.value).toLocaleString()}</p>
                  <p className="mt-micro text-label font-normal text-text-muted">{rate}% of leads</p>
                </div>
              </div>
            )
          })}
        </div>
      </PanelBody>
    </Panel>
  )
}
