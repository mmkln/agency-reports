import { Switch } from '@/shared/ui'

function VisibilityRow({ item, onChange }) {
  return (
    <label className="flex min-h-target items-center justify-between gap-item py-tag">
      <span className="text-ui text-text-primary">{item.label}</span>
      <Switch
        aria-label={`Show ${item.label}`}
        checked={item.isVisible}
        onCheckedChange={(checked) => onChange(item.id, checked)}
      />
    </label>
  )
}

export function DashboardSectionsSection({
  onMetricVisibilityChange,
  onSectionVisibilityChange,
  overviewMetrics,
  sections,
}) {
  return (
    <section className="grid gap-component">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Visible content</h3>
        <p className="mt-micro text-label text-text-muted">
          Keep the report focused on the metrics and sections this workspace uses.
        </p>
      </div>
      <div>
        <p className="text-label font-medium text-text-secondary">Overview metrics</p>
        <div className="divide-y divide-separator">
          {overviewMetrics.map((item) => (
            <VisibilityRow item={item} key={item.id} onChange={onMetricVisibilityChange} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-label font-medium text-text-secondary">Report sections</p>
        <div className="divide-y divide-separator">
          {sections.map((item) => (
            <VisibilityRow item={item} key={item.id} onChange={onSectionVisibilityChange} />
          ))}
        </div>
      </div>
    </section>
  )
}
