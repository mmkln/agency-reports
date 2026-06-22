import { PERFORMANCE_CHANNEL_META } from '../../entities/performance-dashboard'
import {
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  StatusBadge,
} from '@/shared/ui'

import {
  formatMetricLabel,
  formatNumber,
  getGoalProgress,
  getMetricStatusTone,
} from './formatters'

export function GoalsSection({ goals }) {
  if (!goals?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Targets anchor performance so numbers are not shown without context."
        title="Goals vs Actual"
      />
      <PanelBody className="grid gap-component md:grid-cols-2">
        {goals.map((goal, index) => {
          const progress = getGoalProgress(goal)

          return (
            <div className="grid gap-3 rounded-control border border-control-border bg-block-subtle p-4" key={goal.id || `${goal.name}-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">{goal.name || goal.metric}</p>
                  {goal.note ? <p className="mt-1 text-ui text-text-secondary">{goal.note}</p> : null}
                </div>
                <StatusBadge label={formatMetricLabel(goal.status ?? 'on_track')} tone={getMetricStatusTone(goal.status)} />
              </div>
              <ProgressBar
                label={`${goal.name || goal.metric} progress`}
                tone={progress >= 100 ? 'green' : goal.status === 'behind' ? 'orange' : 'blue'}
                value={progress}
              />
              <p className="text-label font-normal text-text-muted">
                Actual {goal.actual ?? 'n/a'} / Target {goal.target ?? 'n/a'}
              </p>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

const funnelFields = [
  ['spend', 'Spend'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['visitors', 'Visitors'],
  ['leads', 'Leads'],
  ['qualified_leads', 'Qualified leads'],
  ['booked_calls', 'Booked calls'],
  ['sales', 'Sales'],
  ['revenue', 'Revenue'],
]

export function FunnelSection({ funnel }) {
  const populatedStages = funnelFields
    .map(([fieldName, label]) => ({
      label,
      value: funnel?.[fieldName],
    }))
    .filter((stage) => typeof stage.value === 'number')

  if (!populatedStages.length) {
    return null
  }

  const maxValue = Math.max(...populatedStages.map((stage) => stage.value), 1)

  return (
    <Panel>
      <PanelHeader
        subtitle="Shows where attention turns into leads, sales, or revenue."
        title="Funnel"
      />
      <PanelBody className="grid gap-3">
        {populatedStages.map((stage) => (
          <div className="grid gap-2 rounded-control bg-block-subtle p-3" key={stage.label}>
            <div className="flex items-center justify-between gap-3 text-ui">
              <span className="font-medium text-text-primary">{stage.label}</span>
              <span className="font-semibold text-text-secondary">{formatNumber(stage.value)}</span>
            </div>
            <ProgressBar
              label={`${stage.label} funnel value`}
              value={Math.max(4, Math.round((stage.value / maxValue) * 100))}
            />
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function ChannelBreakdownSection({ channels }) {
  if (!channels?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Channel-level outcomes and efficiency, with portal-ready context."
        title="Channel Breakdown"
      />
      <PanelBody className="grid gap-component">
        {channels.map((channel, index) => (
          <div className="rounded-block border border-control-border bg-block p-4 shadow-none" key={channel.id || `${channel.channel}-${index}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-ui text-text-primary">
                  {PERFORMANCE_CHANNEL_META[channel.channel]?.label ?? channel.channel ?? 'Channel'}
                </h3>
                {channel.summary ? (
                  <p className="mt-2 max-w-readable text-body text-text-secondary">{channel.summary}</p>
                ) : null}
              </div>
              {typeof channel.roas === 'number' ? (
                <StatusBadge label={`${formatNumber(channel.roas)} ROAS`} tone={channel.roas >= 2 ? 'green' : 'amber'} />
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <SmallMetric label="Spend" value={formatNumber(channel.spend)} />
              <SmallMetric label="Qualified leads" value={formatNumber(channel.qualified_leads)} />
              <SmallMetric label="Revenue" value={formatNumber(channel.revenue)} />
              <SmallMetric label="CPL" value={formatNumber(channel.cpl)} />
              <SmallMetric label="CVR" value={formatNumber(channel.conversion_rate, '%')} />
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-control bg-surface-subtle px-3 py-2">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-1 font-semibold text-text-primary">{value}</p>
    </div>
  )
}
