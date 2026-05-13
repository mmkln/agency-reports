import { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  PrimitiveCard as Card,
  Separator,
  StatusBadge as SharedStatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui'

import { updateAssignedTask } from '../../../domain/services/teamTaskService'
import { getTaskStatusSelectionOptions } from '../../../domain/policies/taskPolicy'
import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { loadTeamTasks, normalizeTeamTaskFilters } from './teamTaskFilterState'

const statusIconClasses = {
  amber: 'text-text-quaternary',
  blue: 'text-text-quaternary',
  purple: 'text-text-quaternary',
  green: 'text-text-quaternary',
  neutral: 'text-text-quaternary',
  rose: 'text-text-quaternary',
}

function getTaskStatusTone(status) {
  const meta = TASK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }

  return meta.tone
}

function StatusBadge({ status }) {
  const meta = TASK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
  return <SharedStatusBadge meta={meta} />
}

function StatusInlineValue({ status }) {
  const meta = TASK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
  const tone = getTaskStatusTone(status)

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
      <Icon
        className={`shrink-0 ${statusIconClasses[tone] ?? statusIconClasses.neutral}`}
        name={meta.icon ?? 'circle'}
        size={16}
      />
      {meta.label}
    </span>
  )
}

const taskFieldTextareaClass = 'resize-none border-transparent bg-control px-component py-control text-sm leading-6 shadow-none hover:bg-control-hover focus-visible:border-ring focus-visible:bg-block focus-visible:ring-2 focus-visible:ring-ring/25'

function formatTaskDueDate(date) {
  if (!date) {
    return 'No due date'
  }

  const dueDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDay = new Date(dueDate)
  dueDay.setHours(0, 0, 0, 0)

  const dayDifference = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000)

  if (dayDifference === 0) {
    return 'Today'
  }

  if (dayDifference === 1) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dueDate)
}

function VisibilityBadge({ visibility }) {
  const isClientVisible = visibility === VISIBILITY.CLIENT_VISIBLE

  return (
    <Badge
      className={isClientVisible
        ? 'border-action/20 bg-action-muted text-action'
        : 'border-control-border bg-control text-text-secondary'}
      variant="outline"
    >
      <Icon name={isClientVisible ? 'user' : 'lock'} size={12} />
      {isClientVisible ? 'Client visible' : 'Internal'}
    </Badge>
  )
}

function formatDueDate(date) {
  if (!date) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

function EmptyTasksState({ hasFilters }) {
  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardContent className="flex min-h-[260px] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-control text-text-quaternary">
            <Icon name="checkCircle2" size={30} />
          </div>
          <h2 className="mt-5 text-base font-semibold text-text-primary">
            {hasFilters ? 'No tasks match these filters' : 'No assigned tasks right now'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {hasFilters
              ? 'Adjust the filters to see more operational work.'
              : 'Assigned client work will appear here when tasks are created.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskList({ onSelectTask, selectedTaskId, tasks }) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden border-control-border bg-block py-0 shadow-none">
      <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Client / Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Visibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isSelected = selectedTaskId === task.id

              return (
                <TableRow
                  className={`cursor-pointer align-top transition-colors ${
                    isSelected ? 'bg-action-muted' : 'hover:bg-surface-subtle'
                  }`}
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                >
                  <TableCell>
                    <p className="font-semibold text-text-primary">{task.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-text-muted">{task.description}</p>
                    {task.blockerNote ? (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        <Icon name="triangleAlert" size={12} />
                        Blocker noted
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-text-secondary">{task.clientName}</p>
                    <p className="mt-1 text-xs text-text-muted">{task.projectName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDueDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <VisibilityBadge visibility={task.visibility} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
      </Table>
    </Card>
  )
}

function TaskDetailsContent({
  draft,
  error,
  onChange,
  task,
}) {
  const nextStatus = draft.status
  const showBlockerReason = nextStatus === TASK_STATUSES.BLOCKED
  const showWaitingReason = nextStatus === TASK_STATUSES.WAITING_CLIENT
  const isDone = nextStatus === TASK_STATUSES.DONE
  const blockerReasonError = showBlockerReason && error === 'Blocker reason is required.'
  const selectableStatuses = getTaskStatusSelectionOptions({
    currentStatus: task.status,
    selectedStatus: nextStatus,
  })

  return (
    <div className="h-full overflow-y-auto px-panel py-card">
      <div className="mx-auto grid max-w-readable gap-panel">
        {task.description ? (
          <section className="grid gap-1">
            <p className="text-label text-text-muted">Details</p>
            <p className="text-sm leading-6 text-text-secondary">{task.description}</p>
          </section>
        ) : null}

        <section className="grid gap-item">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-label text-text-muted">Status</p>
              {isDone ? <span className="text-sm text-text-muted">Completed. Re-open if needed.</span> : null}
            </div>
            {selectableStatuses.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-control-small gap-2 px-control-small" size="sm" type="button" variant="ghost">
                    <StatusInlineValue status={nextStatus} />
                    <Icon className="text-text-muted" name="chevronDown" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Change status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    onValueChange={(status) => onChange({ ...draft, status })}
                    value={nextStatus}
                  >
                    {selectableStatuses.map((status) => {
                      const meta = TASK_STATUS_META[status] ?? {
                        label: status,
                        tone: 'neutral',
                      }
                      const tone = getTaskStatusTone(status)

                      return (
                        <DropdownMenuRadioItem
                          className="cursor-pointer"
                          key={status}
                          value={status}
                        >
                          <Icon
                            className={`shrink-0 ${statusIconClasses[tone] ?? statusIconClasses.neutral}`}
                            name={meta.icon ?? 'circle'}
                            size={16}
                          />
                          <span className="min-w-0 flex-1 truncate">{meta.label}</span>
                        </DropdownMenuRadioItem>
                      )
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusInlineValue status={nextStatus} />
            )}
          </div>

          {showBlockerReason ? (
            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                  <Icon className="text-destructive" name="triangleAlert" size={14} />
                  Blocker reason
                </span>
                <span className="text-xs text-text-muted">Required</span>
              </span>
              <Textarea
                aria-invalid={Boolean(blockerReasonError)}
                className={`${taskFieldTextareaClass} min-h-20 aria-invalid:border-destructive aria-invalid:ring-destructive/25`}
                onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
                placeholder="What is blocking progress?"
                value={draft.blockerNote}
              />
              <span className={`text-xs ${blockerReasonError ? 'text-destructive' : 'text-text-muted'}`}>
                Required when a task is blocked.
              </span>
            </label>
          ) : null}

          {showWaitingReason ? (
            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                <Icon className="text-text-quaternary" name="clock" size={14} />
                Waiting on
              </span>
              <Textarea
                className={`${taskFieldTextareaClass} min-h-20`}
                onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
                placeholder="What client answer or asset is needed?"
                value={draft.blockerNote}
              />
              <span className="text-xs text-text-muted">Use this for context before creating a formal request.</span>
            </label>
          ) : null}
        </section>

        <Separator />

        <label className="grid gap-2">
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                <Icon className="text-text-quaternary" name="messageSquare" size={14} />
                Client-safe update
              </span>
              <span className="mt-1 block text-xs font-normal text-text-muted">Short summary Admin can use on the Client Overview.</span>
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
            <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
              <Icon className="text-text-quaternary" name="lock" size={14} />
              Internal notes
            </span>
            <span className="mt-1 block text-xs font-normal text-text-muted">Private to agency. Never appears in the client overview.</span>
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

function TaskDetailsModal({
  draft,
  error,
  isOpen,
  onChange,
  onClose,
  onSave,
  saveState,
  task,
  isDirty,
}) {
  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        {task && draft ? (
          <div className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
            <OverlayHeader className="pr-control-xl">
              <DialogHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <DialogTitle className="text-lg font-semibold text-text-primary">{task.title}</DialogTitle>
                    <DialogDescription className="sr-only">{task.description || task.title}</DialogDescription>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span>{task.clientName}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" size={14} />
                    {formatTaskDueDate(task.dueDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="user" size={14} />
                    {task.assigneeName || 'Unassigned'}
                  </span>
                  <span>{draft.visibility === VISIBILITY.CLIENT_VISIBLE ? 'Client-facing' : 'Internal'}</span>
                </div>
              </DialogHeader>
            </OverlayHeader>
            <OverlayBody className="min-h-0 overflow-hidden p-0">
                <TaskDetailsContent
                  draft={draft}
                  error={error}
                  onChange={onChange}
                  task={task}
                />
            </OverlayBody>
            <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm">
                {error && error !== 'Blocker reason is required.' ? (
                  <span className="text-destructive">{error}</span>
                ) : saveState ? (
                  <span className="text-text-muted">{saveState}</span>
                ) : isDirty ? (
                  <span className="text-text-muted">Unsaved changes</span>
                ) : null}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button onClick={onClose} size="lg" type="button" variant="outline">
                  Cancel
                </Button>
                <Button
                  className="bg-action text-action-foreground hover:bg-action-hover"
                  disabled={!isDirty}
                  onClick={onSave}
                  size="lg"
                  type="button"
                >
                <Icon name="fileText" size={15} />
                Save Updates
                </Button>
              </div>
            </OverlayFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function createTaskDraft(task) {
  if (!task) {
    return null
  }

  return {
    blockerNote: task.blockerNote,
    clientSafeSummary: task.clientSafeSummary,
    internalNote: task.internalNote,
    status: task.status,
    visibility: task.visibility,
  }
}

function isTaskDraftChanged(task, draft) {
  if (!task || !draft) {
    return false
  }

  const persistedDraft = createTaskDraft(task)

  return Object.keys(persistedDraft).some((key) => persistedDraft[key] !== draft[key])
}

export function TeamTasksPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const [reloadTick, setReloadTick] = useState(0)
  const filters = useMemo(() => normalizeTeamTaskFilters(routeParams), [routeParams])
  const taskData = useMemo(() => {
    void reloadTick
    return loadTeamTasks(filters, runtime)
  }, [filters, reloadTick, runtime])
  const [selectedTaskId, setSelectedTaskId] = useState(taskData.tasks[0]?.id ?? '')
  const selectedTask = useMemo(
    () => taskData.tasks.find((task) => task.id === selectedTaskId) ?? taskData.tasks[0] ?? null,
    [selectedTaskId, taskData.tasks],
  )
  const [taskDraft, setTaskDraft] = useState(() => createTaskDraft(selectedTask))
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('')
  const isTaskDetailsDirty = isTaskDraftChanged(selectedTask, taskDraft)

  function selectTask(taskId) {
    const task = taskData.tasks.find((item) => item.id === taskId) ?? null
    setSelectedTaskId(taskId)
    setTaskDraft(createTaskDraft(task))
    setIsTaskDetailsOpen(Boolean(task))
    setError('')
    setSaveState('')
  }

  function saveTaskUpdate() {
    try {
      if (taskDraft?.status === TASK_STATUSES.BLOCKED && !taskDraft.blockerNote.trim()) {
        setError('Blocker reason is required.')
        setSaveState('')
        toast.warning('Blocker reason required', 'Add a short note before marking this task as blocked.')
        return
      }

      updateAssignedTask({
        input: taskDraft,
        repositories: runtime.repositories,
        taskId: selectedTask.id,
        viewer: runtime.viewer,
      })
      setError('')
      setSaveState('Task update saved.')
      setReloadTick((currentTick) => currentTick + 1)
      toast.success('Task updated', `${selectedTask.title} was saved.`)
    } catch (caughtError) {
      setError(caughtError.message)
      setSaveState('')
      toast.error('Task update failed', caughtError.message)
    }
  }

  const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'scope' && value !== 'all')

  function updateTaskDraft(nextDraft) {
    setTaskDraft(nextDraft)
    setError('')
    setSaveState('')
  }

  return (
    <div className="grid gap-6">
      <div className="grid content-start gap-6">
        {taskData.tasks.length > 0 ? (
          <TaskList
            onSelectTask={selectTask}
            selectedTaskId={selectedTask?.id}
            tasks={taskData.tasks}
          />
        ) : (
          <EmptyTasksState hasFilters={hasFilters} />
        )}
      </div>
      <TaskDetailsModal
        draft={taskDraft}
        error={error}
        isDirty={isTaskDetailsDirty}
        isOpen={isTaskDetailsOpen}
        onChange={updateTaskDraft}
        onClose={() => setIsTaskDetailsOpen(false)}
        onSave={saveTaskUpdate}
        saveState={saveState}
        task={selectedTask}
      />
    </div>
  )
}
