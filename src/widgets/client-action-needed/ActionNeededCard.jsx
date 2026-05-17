import {
  Button,
  LabeledNote,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import { formatActionDate } from './actionNeededFormatting'

const actionTypeMeta = {
  access_needed: {
    iconName: 'lock',
    label: 'Access',
  },
  approval: {
    iconName: 'checkCircle2',
    label: 'Approval',
  },
  confirmation: {
    iconName: 'messageSquare',
    label: 'Confirmation',
  },
  feedback: {
    iconName: 'messageSquare',
    label: 'Feedback',
  },
  file_needed: {
    iconName: 'fileText',
    label: 'File needed',
  },
  question: {
    iconName: 'helpCircle',
    label: 'Question',
  },
}

function ActionTypeLabel({ action }) {
  const meta = action.clinicAction?.typeMeta
    ? {
        iconName: action.clinicAction.typeMeta.icon,
        label: action.clinicAction.typeMeta.label,
      }
    : actionTypeMeta[action.actionType] ?? actionTypeMeta.question

  return (
    <span className="inline-flex items-center gap-1 rounded-control bg-control px-2 py-1 text-label text-text-secondary">
      <Icon name={meta.iconName} size={13} />
      {meta.label}
    </span>
  )
}

function ClinicActionContext({ action }) {
  const clinicAction = action.clinicAction

  if (!clinicAction) {
    return null
  }

  const contextItems = [
    clinicAction.serviceLine?.name,
    clinicAction.location?.name,
  ].filter(Boolean)

  return (
    <div className="mt-component grid gap-item rounded-control bg-block-subtle p-component">
      {contextItems.length ? (
        <div className="flex flex-wrap gap-tag">
          {contextItems.map((item) => (
            <span className="rounded-control bg-control px-2 py-1 text-label text-text-secondary" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {clinicAction.patientImpact ? (
        <p className="text-body text-text-secondary">{clinicAction.patientImpact}</p>
      ) : null}
      {clinicAction.complianceRisk ? (
        <p className="text-label font-normal text-text-muted">{clinicAction.complianceRisk}</p>
      ) : null}
    </div>
  )
}

export function ActionNeededCard({ action, onViewDetails }) {
  return (
    <article className="rounded-block bg-block px-card py-component shadow-none">
      <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-item flex flex-wrap items-center gap-item">
            <ActionTypeLabel action={action} />
            {action.isOverdue ? (
              <span className="rounded-control bg-destructive/10 px-2 py-1 text-label text-destructive">
                Overdue
              </span>
            ) : null}
            {action.isDueSoon ? (
              <span className="rounded-control bg-warning-muted px-2 py-1 text-label text-warning-foreground">
                Due soon
              </span>
            ) : null}
          </div>
          <h2 className="text-ui font-semibold text-text-primary">{action.title}</h2>
          <p className={`mt-item text-label font-normal ${action.isOverdue ? 'text-destructive' : 'text-text-muted'}`}>
            Due {formatActionDate(action.dueDate)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-item sm:justify-end">
          <StatusBadge meta={action.priorityMeta} />
          <StatusBadge meta={action.statusMeta} />
        </div>
      </div>

      {action.description ? (
        <p className="mt-component max-w-readable text-ui font-normal text-text-secondary">{action.description}</p>
      ) : null}

      <ClinicActionContext action={action} />

      {action.clientResponse ? (
        <LabeledNote className="mt-component" label="Your response">
          <p>{action.clientResponse}</p>
          {action.respondedAt ? <p className="mt-micro text-label text-text-muted">Sent {formatActionDate(action.respondedAt)}</p> : null}
        </LabeledNote>
      ) : null}

      <div className="mt-component flex flex-wrap gap-item">
        {action.relatedLink ? (
          <Button asChild size="sm" variant="ghost">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">
              Open related link
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
        <Button onClick={() => onViewDetails(action)} size="sm" type="button">
          View details
        </Button>
      </div>
    </article>
  )
}
