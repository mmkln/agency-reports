import {
  Badge,
  Button,
  PrimitiveCard as Card,
  Separator,
  Textarea,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'
import { formatTaskDueDate, TASK_STATUSES } from '@/entities/task'
import { TaskMetaRow, TaskStatusSelect } from '@/entities/task/ui'

const taskFieldTextareaClass = 'resize-none border-transparent bg-control px-component py-control text-body shadow-none hover:bg-control-hover focus-visible:border-ring focus-visible:bg-block focus-visible:ring-2 focus-visible:ring-ring/25'

function TeamTaskDetailsContent({
  blockerReasonError,
  draft,
  onChange,
  statusOptions,
  task,
}) {
  const nextStatus = draft.status
  const showBlockerReason = nextStatus === TASK_STATUSES.BLOCKED
  const showWaitingReason = nextStatus === TASK_STATUSES.WAITING_CLIENT
  const isDone = nextStatus === TASK_STATUSES.DONE

  return (
    <div className="px-card py-card">
      <div className="grid gap-panel">
        {task.description ? (
          <section className="grid gap-1">
            <p className="text-label text-text-muted">Details</p>
            <p className="text-body text-text-secondary">{task.description}</p>
          </section>
        ) : null}

        <section className="grid gap-item">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-label text-text-muted">Status</p>
              {isDone ? <span className="text-ui text-text-muted">Completed. Re-open if needed.</span> : null}
            </div>
            <TaskStatusSelect
              onChange={(status) => onChange({ ...draft, status })}
              options={statusOptions}
              value={nextStatus}
            />
          </div>

          {showBlockerReason ? (
            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-ui text-text-primary">
                  <Icon className="text-destructive" name="triangleAlert" size={14} />
                  Blocker reason
                </span>
                <span className="text-label font-normal text-text-muted">Required</span>
              </span>
              <Textarea
                aria-invalid={Boolean(blockerReasonError)}
                className={`${taskFieldTextareaClass} min-h-20 aria-invalid:border-destructive aria-invalid:ring-destructive/25`}
                onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
                placeholder="What is blocking progress?"
                value={draft.blockerNote}
              />
              <span className={`text-label font-normal ${blockerReasonError ? 'text-destructive' : 'text-text-muted'}`}>
                Required when a task is blocked.
              </span>
            </label>
          ) : null}

          {showWaitingReason ? (
            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-ui text-text-primary">
                <Icon className="text-text-quaternary" name="clock" size={14} />
                Waiting on
              </span>
              <Textarea
                className={`${taskFieldTextareaClass} min-h-20`}
                onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
                placeholder="What client answer or asset is needed?"
                value={draft.blockerNote}
              />
              <span className="text-label font-normal text-text-muted">Use this for context before creating a formal request.</span>
            </label>
          ) : null}
        </section>

        <Separator />

        <label className="grid gap-2">
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="inline-flex items-center gap-2 text-ui text-text-primary">
                <Icon className="text-text-quaternary" name="messageSquare" size={14} />
                Client-safe update
              </span>
              <span className="mt-1 block text-label font-normal text-text-muted">Short summary Admin can use on the Client Overview.</span>
            </span>
            <Badge className="shrink-0 bg-control text-text-secondary" variant="secondary">Suggestion</Badge>
          </span>
          <Textarea
            className={`${taskFieldTextareaClass} min-h-32`}
            onChange={(event) => onChange({ ...draft, clientSafeSummary: event.target.value })}
            placeholder="e.g. Completed initial setup, moving to testing phase."
            value={draft.clientSafeSummary}
          />
        </label>

        <label className="grid gap-2">
          <span>
            <span className="inline-flex items-center gap-2 text-ui text-text-primary">
              <Icon className="text-text-quaternary" name="lock" size={14} />
              Internal notes
            </span>
            <span className="mt-1 block text-label font-normal text-text-muted">Private to agency. Never appears in the client overview.</span>
          </span>
          <Textarea
            className={`${taskFieldTextareaClass} min-h-28`}
            onChange={(event) => onChange({ ...draft, internalNote: event.target.value })}
            placeholder="Only agency team can see this."
            value={draft.internalNote}
          />
        </label>
      </div>
    </div>
  )
}

export function TeamTaskDetailPanel({
  blockerReasonError = false,
  draft,
  error,
  isDirty,
  onChange,
  onClose,
  onReset,
  onSave,
  saveState,
  statusOptions,
  task,
}) {
  if (!task || !draft) {
    return null
  }

  return (
    <Card className="overflow-hidden rounded-island border border-island-border bg-block py-0 shadow-none xl:sticky xl:top-card xl:max-h-[calc(100vh-8rem)]">
      <div className="grid min-h-0 xl:max-h-[calc(100vh-8rem)] xl:grid-rows-[auto_minmax(0,1fr)_auto]">
        <div className="border-b border-separator px-card py-component">
          <div className="flex items-start justify-between gap-component">
            <h2 className="min-w-0 text-ui text-text-primary">{task.title}</h2>
            <Button
              aria-label="Close task details"
              onClick={onClose}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Icon name="close" size={16} />
            </Button>
          </div>
          <div className="mt-3">
            <TaskMetaRow
              assigneeName={task.assigneeName}
              clientName={task.clientName}
              dueLabel={formatTaskDueDate(task.dueDate)}
              projectName={task.projectName}
              visibility={task.visibility}
            />
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <TeamTaskDetailsContent
            blockerReasonError={blockerReasonError}
            draft={draft}
            onChange={onChange}
            statusOptions={statusOptions}
            task={task}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-separator px-card py-component sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-ui">
            {error && !blockerReasonError ? (
              <span className="text-destructive">{error}</span>
            ) : saveState ? (
              <span className="text-text-muted">{saveState}</span>
            ) : isDirty ? (
              <span className="text-text-muted">Unsaved changes</span>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={!isDirty} onClick={onReset} type="button" variant="outline">
              Reset
            </Button>
            <Button
              disabled={!isDirty}
              icon={<Icon name="fileText" size={15} />}
              onClick={onSave}
              type="button"
            >
              Save Updates
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
