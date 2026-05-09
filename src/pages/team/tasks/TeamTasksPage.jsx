import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { updateAssignedTask } from '../../../domain/services/teamTaskService'
import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { loadTeamTasks, normalizeTeamTaskFilters } from './teamTaskFilterState'

const statusToneClasses = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  fuchsia: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
}

function StatusBadge({ status }) {
  const meta = TASK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
  const tone = status === TASK_STATUSES.WAITING_CLIENT ? 'fuchsia' : meta.tone

  return (
    <Badge className={statusToneClasses[tone] ?? statusToneClasses.neutral} variant="outline">
      {meta.label}
    </Badge>
  )
}

const actionToneClasses = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  purple: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100',
  red: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  teal: 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100',
}

const statusActionOrder = [
  TASK_STATUSES.DONE,
  TASK_STATUSES.BLOCKED,
  TASK_STATUSES.WAITING_CLIENT,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.TODO,
]

function getStatusAction(taskStatus, nextStatus) {
  if (taskStatus === TASK_STATUSES.BLOCKED && nextStatus === TASK_STATUSES.IN_PROGRESS) {
    return { label: 'Resume Work (Clear Blocker)', tone: 'teal' }
  }

  if (taskStatus === TASK_STATUSES.WAITING_CLIENT && nextStatus === TASK_STATUSES.IN_PROGRESS) {
    return { label: 'Resume Work (Client Answered)', tone: 'teal' }
  }

  if (taskStatus === TASK_STATUSES.DONE && nextStatus === TASK_STATUSES.TODO) {
    return { label: 'Re-open Task', tone: 'neutral' }
  }

  if (taskStatus === TASK_STATUSES.TODO && nextStatus === TASK_STATUSES.IN_PROGRESS) {
    return { label: 'Start Work', tone: 'teal' }
  }

  if (nextStatus === TASK_STATUSES.DONE) {
    return { label: 'Mark Done', tone: 'green' }
  }

  if (nextStatus === TASK_STATUSES.BLOCKED) {
    return { label: 'Block Issue', tone: 'red' }
  }

  if (nextStatus === TASK_STATUSES.WAITING_CLIENT) {
    return { label: 'Wait on Client', tone: 'purple' }
  }

  return {
    label: TASK_STATUS_META[nextStatus]?.label ?? nextStatus,
    tone: 'neutral',
  }
}

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
        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
        : 'border-slate-200 bg-slate-100 text-slate-600'}
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
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="flex min-h-[260px] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="checkCircle2" size={30} />
          </div>
          <h2 className="mt-5 text-base font-semibold text-slate-900">
            {hasFilters ? 'No tasks match these filters' : 'No assigned tasks right now'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
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
    <Card className="overflow-hidden border-slate-200 bg-white py-0 shadow-xs">
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
                    isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                  }`}
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                >
                  <TableCell>
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description}</p>
                    {task.blockerNote ? (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                        <Icon name="warning" size={12} />
                        Blocker noted
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-700">{task.clientName}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.projectName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDueDate(task.dueDate)}</TableCell>
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
  saveState,
  task,
}) {
  const nextStatus = draft.status
  const showBlockerReason = nextStatus === TASK_STATUSES.BLOCKED
  const showWaitingReason = nextStatus === TASK_STATUSES.WAITING_CLIENT
  const isDone = nextStatus === TASK_STATUSES.DONE

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-emerald-100 bg-emerald-50 text-[10px] font-bold uppercase tracking-wide text-emerald-700" variant="outline">
            {task.clientName}
          </Badge>
          <VisibilityBadge visibility={draft.visibility} />
        </div>

        <h2 className="mt-3 text-lg font-bold leading-6 text-slate-900">{task.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={14} />
            {formatTaskDueDate(task.dueDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="user" size={14} />
            {task.assigneeName || 'Unassigned'}
          </span>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">Status actions</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-700">Current Status:</span>
            <StatusBadge status={nextStatus} />
          </div>
          {isDone ? (
            <p className="mt-4 px-2 text-sm italic text-slate-500">Task is completed. Re-open if needed.</p>
          ) : null}
          <div className="mt-4 grid gap-2">
            {[...task.availableTransitions].sort(
              (statusA, statusB) => statusActionOrder.indexOf(statusA) - statusActionOrder.indexOf(statusB),
            ).map((status) => {
              const action = getStatusAction(task.status, status)

              return (
                <button
                  className={`h-10 rounded-md border px-3 text-sm font-medium transition ${
                    actionToneClasses[action.tone] ?? actionToneClasses.neutral
                  } ${nextStatus === status ? 'ring-2 ring-brand/20' : ''}`}
                  key={status}
                  onClick={() => onChange({ ...draft, status })}
                  type="button"
                >
                  {action.label}
                </button>
              )
            })}
          </div>
        </section>

        {showBlockerReason ? (
          <section className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-700">
              <Icon name="warning" size={14} />
              Blocker reason
            </div>
            <Textarea
              className="min-h-24 border-rose-200 bg-white focus-visible:border-rose-300 focus-visible:ring-rose-200"
              onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
              placeholder="Provide details..."
              value={draft.blockerNote}
            />
            <p className="mt-2 text-xs text-rose-600">Required. This helps the team understand why progress stopped.</p>
          </section>
        ) : null}

        {showWaitingReason ? (
          <section className="mt-5 rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-fuchsia-700">
              <Icon name="clock" size={14} />
              Waiting on what?
            </div>
            <Textarea
              className="min-h-20 border-fuchsia-200 bg-white focus-visible:border-fuchsia-300 focus-visible:ring-fuchsia-200"
              onChange={(event) => onChange({ ...draft, blockerNote: event.target.value })}
              placeholder="Provide details..."
              value={draft.blockerNote}
            />
            <p className="mt-2 text-xs text-fuchsia-700">If action is needed, Admin can turn this into a formal Request.</p>
          </section>
        ) : null}

        <Separator className="my-6" />

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2">
            <Icon className="text-slate-400" name="lock" size={14} />
            Internal Notes
          </span>
          <span className="text-xs font-normal text-slate-500">Never appears in client overview. Private to agency.</span>
          <Textarea
            className="min-h-28"
            onChange={(event) => onChange({ ...draft, internalNote: event.target.value })}
            placeholder="Only agency team can see this."
            value={draft.internalNote}
          />
        </label>

        <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900">
                <Icon name="messageSquare" size={14} />
                Client-Safe Summary
              </p>
              <p className="mt-2 text-xs text-blue-700">Write an update Admin can use for the Client Overview.</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700" variant="secondary">Suggestion</Badge>
          </div>
          <Textarea
            className="min-h-20 border-blue-200 bg-white focus-visible:border-blue-300 focus-visible:ring-blue-200"
            onChange={(event) => onChange({ ...draft, clientSafeSummary: event.target.value })}
            placeholder="e.g. Completed initial setup, moving to testing phase."
            value={draft.clientSafeSummary}
          />
        </section>

        {error ? (
          <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
        {saveState ? (
          <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveState}</p>
        ) : null}
    </div>
  )
}

function TaskDetailsDrawer({
  draft,
  error,
  isOpen,
  onChange,
  onClose,
  onSave,
  saveState,
  task,
}) {
  return (
    <Sheet onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <SheetContent className="w-full max-w-[430px] gap-0 p-0 sm:max-w-[430px]" showCloseButton={false}>
        {task && draft ? (
          <>
            <SheetHeader className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <SheetTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Icon className="text-slate-400" name="grid" size={17} />
                    Task Details
                  </SheetTitle>
                  <SheetDescription className="sr-only">{task.title}</SheetDescription>
                </div>
                <Button aria-label="Close task details" onClick={onClose} size="icon-lg" type="button" variant="outline">
                  <Icon name="close" size={16} />
                </Button>
              </div>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              <TaskDetailsContent
                draft={draft}
                error={error}
                onChange={onChange}
                saveState={saveState}
                task={task}
              />
            </div>
            <SheetFooter className="flex-row justify-end border-slate-200 bg-white px-6 py-4 shadow-[0_-8px_20px_rgb(15_23_42/0.04)]">
              <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={onSave} size="lg" type="button">
                <Icon name="fileText" size={15} />
                Save Updates
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
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
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('')

  function selectTask(taskId) {
    const task = taskData.tasks.find((item) => item.id === taskId) ?? null
    setSelectedTaskId(taskId)
    setTaskDraft(createTaskDraft(task))
    setIsTaskDrawerOpen(Boolean(task))
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
      <TaskDetailsDrawer
        draft={taskDraft}
        error={error}
        isOpen={isTaskDrawerOpen}
        onChange={updateTaskDraft}
        onClose={() => setIsTaskDrawerOpen(false)}
        onSave={saveTaskUpdate}
        saveState={saveState}
        task={selectedTask}
      />
    </div>
  )
}
