import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LabeledNote,
  StatusBadge,
  Textarea,
} from '@/shared/ui'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { Icon } from '../../shared/icons'
import { formatActionDate } from './actionNeededFormatting'

function DetailRow({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div>
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-1 text-ui text-text-primary">{value}</p>
    </div>
  )
}

function HistoryItem({ event }) {
  const actorRole = event.metadata?.actor_role ? ` · ${event.metadata.actor_role}` : ''

  return (
    <li className="rounded-control bg-block-subtle px-3 py-2">
      <p className="text-ui text-text-primary">{event.type.replaceAll('_', ' ')}</p>
      <p className="mt-1 text-label font-normal text-text-muted">
        {formatActionDate(event.created_at)}
        {actorRole}
      </p>
    </li>
  )
}

export function ActionNeededDetailDialog({
  action,
  isOpen,
  onAnswer,
  onClose,
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canRespond = action?.status === NEEDED_ACTION_STATUSES.PENDING
  const isApproval = action?.actionType === 'approval'
  const history = action?.responseHistory ?? []

  function submitResponse(responseStatus) {
    try {
      onAnswer(action, message || 'Completed by client', { responseStatus })
      setMessage('')
      setError('')
      onClose()
    } catch (caughtError) {
      setError(caughtError.message)
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-h-overlay max-w-modal-lg overflow-y-auto">
        {action ? (
          <>
            <DialogHeader>
              <DialogTitle>{action.title}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-5">
              <div className="flex flex-wrap gap-tag">
                <StatusBadge meta={action.priorityMeta} />
                <StatusBadge meta={action.statusMeta} />
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

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Due" value={formatActionDate(action.dueDate)} />
                <DetailRow label="Owner" value={action.clientOwner || 'Client'} />
                <DetailRow label="Clinic action" value={action.clinicAction?.typeMeta?.label} />
                <DetailRow label="Service line" value={action.clinicAction?.serviceLine?.name} />
                <DetailRow label="Location" value={action.clinicAction?.location?.name} />
                <DetailRow label="Why this is needed" value={action.whyNeeded} />
                <DetailRow label="Impact if delayed" value={action.impactIfDelayed} />
                <DetailRow label="Patient impact" value={action.clinicAction?.patientImpact} />
                <DetailRow label="Compliance risk" value={action.clinicAction?.complianceRisk} />
              </div>

              {action.description ? (
                <div>
                  <p className="text-label text-text-muted">Details</p>
                  <p className="mt-1 text-body text-text-secondary">{action.description}</p>
                </div>
              ) : null}

              {action.relatedLink ? (
                <Button asChild className="w-fit" size="sm" variant="outline">
                  <a href={action.relatedLink} rel="noreferrer" target="_blank">
                    Open related link
                    <Icon name="arrowUpRight" size={13} />
                  </a>
                </Button>
              ) : null}

              {action.clientResponse ? (
                <LabeledNote label="Your response">
                  <p>{action.clientResponse}</p>
                  {action.respondedAt ? <p className="mt-micro text-label text-text-muted">Sent {formatActionDate(action.respondedAt)}</p> : null}
                </LabeledNote>
              ) : null}

              {canRespond ? (
                <div className="grid gap-2">
                  <label className="text-label text-text-muted" htmlFor="action-needed-response">
                    Response
                  </label>
                  <Textarea
                    id="action-needed-response"
                    onChange={(event) => {
                      setMessage(event.target.value)
                      setError('')
                    }}
                    placeholder={isApproval ? 'Add an approval note or request specific changes...' : 'Write a short response for the agency...'}
                    value={message}
                  />
                  {error ? <p className="text-ui text-destructive">{error}</p> : null}
                </div>
              ) : null}

              {history.length ? (
                <div>
                  <p className="text-label text-text-muted">History</p>
                  <ul className="mt-2 grid gap-2">
                    {history.map((event, index) => (
                      <HistoryItem event={event} key={`${event.type}-${event.created_at}-${index}`} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button onClick={onClose} type="button" variant="outline">
                Close
              </Button>
              {canRespond && isApproval ? (
                <>
                  <Button
                    onClick={() => submitResponse(NEEDED_ACTION_STATUSES.CHANGES_REQUESTED)}
                    type="button"
                    variant="outline"
                  >
                    Request changes
                  </Button>
                  <Button onClick={() => submitResponse(NEEDED_ACTION_STATUSES.APPROVED)} type="button">
                    Approve
                  </Button>
                </>
              ) : null}
              {canRespond && !isApproval ? (
                <Button onClick={() => submitResponse(NEEDED_ACTION_STATUSES.ANSWERED)} type="button">
                  Send response
                </Button>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
