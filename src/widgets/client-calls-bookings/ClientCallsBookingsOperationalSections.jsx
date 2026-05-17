import { Link } from 'react-router-dom'

import {
  Badge,
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  Progress,
  PropertyGrid,
} from '@/shared/ui'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`
}

function getSeverityLabel(severity) {
  return {
    critical: 'Needs action',
    watch: 'Watch',
  }[severity] ?? 'Insight'
}

function getSeverityClassName(severity) {
  return {
    critical: 'bg-warning-muted text-warning-foreground',
    watch: 'bg-fill text-text-secondary',
  }[severity] ?? 'bg-fill text-text-secondary'
}

export function PeakCallTimesSection({ peakCallTimes }) {
  if (!peakCallTimes?.length) {
    return null
  }

  const maxCalls = Math.max(...peakCallTimes.map((item) => item.callCount), 1)

  return (
    <Panel>
      <PanelHeader title="Peak Call Times" />
      <PanelBody className="grid gap-component">
        {peakCallTimes.slice(0, 5).map((item) => (
          <div className="grid gap-item" key={item.label}>
            <div className="flex items-center justify-between gap-component">
              <span className="text-ui text-text-primary">{item.label}</span>
              <span className="text-label tabular-nums text-text-secondary">{formatNumber(item.callCount)} calls</span>
            </div>
            <Progress
              aria-label={`${item.label} peak call volume`}
              value={(item.callCount / maxCalls) * 100}
            />
            <PropertyGrid
              columns={3}
              items={[
                {
                  label: 'Missed',
                  value: formatNumber(item.missedCalls),
                },
                {
                  label: 'Missed rate',
                  value: formatPercent(item.missedRate),
                },
                {
                  label: 'Booked rate',
                  value: formatPercent(item.bookingRate),
                },
              ]}
            />
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function OperationalInsightsSection({ clientId, insights }) {
  if (!insights?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title="Operational Insights" />
      <PanelBody className="grid gap-card">
        {insights.map((insight) => (
          <article className="rounded-block bg-block p-block shadow-block" key={insight.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-tag">
                  <h3 className="text-ui font-medium text-text-primary">{insight.title}</h3>
                  <Badge className={getSeverityClassName(insight.severity)}>
                    {getSeverityLabel(insight.severity)}
                  </Badge>
                </div>
                <p className="mt-2 text-body text-text-secondary">{insight.description}</p>
                <p className="mt-3 text-body text-text-primary">{insight.recommendation}</p>
              </div>
              <span className="text-data tabular-nums text-text-primary">{formatNumber(insight.value)}</span>
            </div>

            {insight.relatedActions.length ? (
              <div className="mt-5 grid gap-tag">
                {insight.relatedActions.map((action) => (
                  <div className="flex flex-col gap-3 rounded-control bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between" key={action.id}>
                    <div className="min-w-0">
                      <p className="text-ui text-text-primary">{action.title}</p>
                      <p className="text-label font-normal text-text-muted">
                        {action.dueDate ? `Due ${new Date(action.dueDate).toLocaleDateString()}` : 'No due date'}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/client/action-needed?clientId=${clientId}`}>
                        Open action
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : insight.suggestedAction ? (
              <div className="mt-5 rounded-control bg-surface-subtle p-3">
                <p className="text-label text-text-muted">Recommended action</p>
                <p className="mt-1 text-ui text-text-primary">{insight.suggestedAction.title}</p>
                <p className="mt-1 text-body text-text-secondary">{insight.suggestedAction.description}</p>
              </div>
            ) : null}
          </article>
        ))}
      </PanelBody>
    </Panel>
  )
}
