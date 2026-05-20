import {
  TablePanel,
} from '@/shared/ui'

function formatStatusLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function SectionHeader({ helper, title }) {
  return (
    <div className="grid gap-micro">
      <h3 className="text-ui font-semibold text-text-primary">{title}</h3>
      {helper ? <p className="text-label font-normal text-text-muted">{helper}</p> : null}
    </div>
  )
}

function MetricPreviewGrid({ metrics }) {
  if (!metrics?.length) {
    return <p className="rounded-control bg-block p-control text-label text-text-muted">No calculated values supplied.</p>
  }

  return (
    <div className="grid gap-control md:grid-cols-2">
      {metrics.map((metric, index) => (
        <div className="grid gap-tag rounded-control bg-block p-control" key={metric.id || index}>
          <div className="flex items-start justify-between gap-control">
            <p className="text-label text-text-muted">{metric.title}</p>
            <span className="rounded-control bg-control px-2 py-1 text-label text-text-secondary">
              {formatStatusLabel(metric.status)}
            </span>
          </div>
          <p className="text-ui font-semibold text-text-primary">{metric.value}</p>
          <p className="text-label font-normal text-text-muted">{metric.source}</p>
        </div>
      ))}
    </div>
  )
}

export function CalculatedDiagnosticFields({ draft }) {
  const content = draft.content
  const deliverabilityMetrics = content.metrics.filter((metric) => [
    'sms-deliverability-rate',
    'sms-opt-out-rate',
    'email-deliverability-rate',
  ].includes(metric.id))

  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="These diagnostic sections are calculated from the imported source batch. Import new source data to change them."
        title="Calculated diagnostics"
      />
      <TablePanel
        columns={[
          { key: 'stage_name', label: 'Funnel stage' },
          { key: 'stage_count', label: 'Count', align: 'right' },
          { key: 'conversion_rate', label: 'Conversion', align: 'right', render: (row) => `${row.conversion_rate}%` },
          { key: 'drop_off_count', label: 'Drop-off', align: 'right' },
          { key: 'target', label: 'Target', align: 'right', render: (row) => `${row.target}%` },
        ]}
        rows={content.funnel.map((stage) => ({ ...stage, id: stage.id ?? stage.stage_name }))}
        title="Funnel Conversion"
      />
      <MetricPreviewGrid metrics={content.speed_to_lead} />
      <TablePanel
        columns={[
          { key: 'channel', label: 'Channel' },
          { key: 'leads', label: 'Leads', align: 'right' },
          { key: 'bookings', label: 'Bookings', align: 'right' },
          { key: 'new_patients', label: 'New patients', align: 'right' },
          { key: 'cost_per_booking', label: 'CPB', align: 'right', render: (row) => `$${row.cost_per_booking || 0}` },
        ]}
        rows={content.channel_attribution.map((channel) => ({ ...channel, id: channel.channel }))}
        title="Channel Attribution"
      />
      <TablePanel
        columns={[
          { key: 'track', label: 'Track' },
          { key: 'bookings', label: 'Bookings', align: 'right' },
          { key: 'reply_rate', label: 'Reply rate', align: 'right', render: (row) => `${row.reply_rate}%` },
          { key: 'cost_per_booking', label: 'CPB', align: 'right', render: (row) => `$${row.cost_per_booking}` },
          { key: 'saturday_slot_fill_rate', label: 'Saturday fill', align: 'right', render: (row) => `${row.saturday_slot_fill_rate}%` },
        ]}
        rows={content.reactivation_tracks.map((track) => ({ ...track, id: track.id ?? track.track }))}
        title="Reactivation Track Performance"
      />
      <div className="grid gap-control lg:grid-cols-2">
        <MetricPreviewGrid metrics={deliverabilityMetrics} />
        <MetricPreviewGrid metrics={content.front_desk_health} />
      </div>
      <div className="grid gap-control lg:grid-cols-2">
        <MetricPreviewGrid metrics={content.operations_chips} />
        <MetricPreviewGrid metrics={content.reputation_referral} />
      </div>
    </section>
  )
}
