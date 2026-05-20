import {
  Panel,
  PanelBody,
  PanelHeader,
  TableBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import {
  formatClinicLabel,
  formatClinicValue,
  formatDateTime,
  statusTone,
} from './format'

const toneClass = {
  blue: 'bg-action-muted text-action',
  green: 'bg-success-muted text-success',
  orange: 'bg-warning-muted text-warning-foreground',
  rose: 'bg-destructive-muted text-destructive',
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatQueueMeta(item) {
  return [
    item.channel,
    item.status,
    item.age_minutes ? `${item.age_minutes} min` : null,
    item.due_at ? `Due ${formatDateTime(item.due_at)}` : null,
  ].filter(Boolean).join(' | ')
}

function getAlertValue(item) {
  return firstDefined(item.count, item.value, item.status, 'Recorded')
}

export function OperationalTriageStrip({
  alerts = [],
  appointmentSnapshot,
  workflowAlerts = [],
}) {
  const combinedAlerts = [...alerts, ...workflowAlerts]
  const appointmentItems = Object.entries(appointmentSnapshot ?? {})
    .slice(0, 4)
    .map(([key, value]) => ({
      id: key,
      label: key.replaceAll('_', ' '),
      value,
    }))

  if (!combinedAlerts.length && !appointmentItems.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader iconName="triangleAlert" title="Operational Triage" />
      <PanelBody className="grid gap-control xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="grid gap-control sm:grid-cols-2 xl:grid-cols-3">
          {combinedAlerts.map((item, index) => {
            const tone = statusTone(item.severity ?? item.status)

            return (
              <div className="rounded-control bg-block-subtle p-control" key={item.id ?? `${item.label}-${index}`}>
                <div className="flex items-start justify-between gap-control">
                  <p className="text-label font-normal text-text-muted">{formatClinicLabel(item)}</p>
                  <span className={`rounded-control px-2 py-1 text-label ${toneClass[tone]}`}>
                    {item.severity ?? item.status ?? 'open'}
                  </span>
                </div>
                <p className="mt-control text-heading text-text-primary">{getAlertValue(item)}</p>
                {item.threshold ? (
                  <p className="mt-tag text-label font-normal text-text-muted">{item.threshold}</p>
                ) : null}
              </div>
            )
          })}
        </div>

        {appointmentItems.length ? (
          <div className="grid gap-item rounded-control bg-block-subtle p-control">
            <div className="flex items-center gap-tag text-text-primary">
              <Icon name="calendar" size={16} />
              <p className="text-ui font-semibold">Appointment Control</p>
            </div>
            <div className="grid grid-cols-2 gap-item">
              {appointmentItems.map((item) => (
                <div key={item.id}>
                  <p className="text-label font-normal capitalize text-text-muted">{item.label}</p>
                  <p className="mt-micro text-title text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function QueueWorkloadPanel({
  callbackQueue = [],
  callQueue = [],
  replyQueue = [],
  rowsVisible,
}) {
  const queueGroups = [
    ['Replies', replyQueue],
    ['Calls', callQueue],
    ['Callbacks', callbackQueue],
  ]
  const nextItems = queueGroups
    .flatMap(([group, items]) => items.map((item) => ({ ...item, group })))
    .slice(0, 4)

  return (
    <Panel>
      <PanelHeader iconName="messageSquare" title="Queue Workload" />
      <PanelBody className="grid gap-control">
        <div className="grid gap-control sm:grid-cols-3">
          {queueGroups.map(([label, items]) => (
            <div className="rounded-control bg-block-subtle p-control" key={label}>
              <p className="text-label font-normal text-text-muted">{label}</p>
              <p className="mt-tag text-heading text-text-primary">{items.length}</p>
            </div>
          ))}
        </div>
        {rowsVisible && nextItems.length ? (
          <div className="grid gap-item">
            {nextItems.map((item) => (
              <div className="flex items-start justify-between gap-control rounded-control bg-block-subtle p-control" key={`${item.group}-${item.id}`}>
                <div className="min-w-0">
                  <p className="text-ui font-medium text-text-primary">{item.title}</p>
                  <p className="mt-tag text-label font-normal text-text-muted">{item.group} | {formatQueueMeta(item)}</p>
                </div>
                <TableBadge tone={statusTone(item.priority)}>{item.priority ?? 'normal'}</TableBadge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-control bg-block-subtle p-control text-ui text-text-muted">
            {rowsVisible ? 'No queued work is visible right now.' : 'Operational queue rows are hidden for this viewer.'}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

export function DecisionPanel({ decisions = [], title = 'Decisions Needed' }) {
  if (!decisions.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader iconName="target" title={title} />
      <PanelBody className="grid gap-item">
        {decisions.map((decision, index) => (
          <div className="flex items-start gap-control rounded-control bg-block-subtle p-control" key={`${decision}-${index}`}>
            <span className="mt-micro flex size-6 shrink-0 items-center justify-center rounded-control bg-action-muted text-label text-action">
              {index + 1}
            </span>
            <p className="text-ui text-text-primary">{decision}</p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function FocusSummaryPanel({ narrative, title = 'Operating Focus' }) {
  if (!narrative) {
    return null
  }

  const items = [
    ['Win', narrative.wins?.[0]],
    ['Risk', narrative.losses?.[0] ?? narrative.watching?.[0]],
    ['Next', narrative.next?.[0]],
  ].filter(([, value]) => value)

  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader iconName="trendUp" title={title} />
      <PanelBody className="grid gap-control md:grid-cols-3">
        {items.map(([label, value]) => (
          <div className="rounded-control bg-block-subtle p-control" key={label}>
            <p className="text-label font-normal text-text-muted">{label}</p>
            <p className="mt-tag text-ui text-text-primary">{value}</p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function MetricComparisonPanel({ items = [], title }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader iconName="calculator" title={title} />
      <PanelBody className="grid gap-control md:grid-cols-3">
        {items.map((item, index) => (
          <div className="rounded-control bg-block-subtle p-control" key={item.id ?? `${item.label}-${index}`}>
            <p className="text-label font-normal text-text-muted">{formatClinicLabel(item)}</p>
            <p className="mt-tag text-title text-text-primary">{formatClinicValue(item)}</p>
            {item.benchmark ? <p className="mt-tag text-label font-normal text-text-muted">{item.benchmark}</p> : null}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
