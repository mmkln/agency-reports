import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui'

export function AnalyticsBreakdownWidget({ data, title }) {
  const rows = data?.rows ?? []
  const total = Number(data?.total ?? 0)

  return (
    <Panel>
      <PanelHeader
        action={<AnalyticsExplanationPopover explanation={data?.explanation} label={title} />}
        title={title}
      />
      <PanelBody className="grid gap-component">
        {rows.length ? rows.map((row) => {
          const share = total ? (Number(row.value) / total) * 100 : 0

          return (
            <div className="grid gap-item" key={row.key}>
              <div className="flex items-center justify-between gap-control text-ui">
                <span className="min-w-0 truncate text-text-secondary">{row.label}</span>
                <span className="shrink-0 tabular-nums text-text-primary">{Number(row.value).toLocaleString()}</span>
              </div>
              <div className="h-tag overflow-hidden rounded-full bg-fill-secondary">
                <div className="h-full rounded-full bg-action" style={{ width: `${share}%` }} />
              </div>
            </div>
          )
        }) : (
          <p className="text-ui text-text-muted">No attributed leads in this period.</p>
        )}
      </PanelBody>
    </Panel>
  )
}
