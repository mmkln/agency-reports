import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Badge,
  Button,
  CardContent,
  ContentToolbar,
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
  Input,
  Label,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  PageShell,
  PrimitiveCard as Card,
  RadixSelect as Select,
  Separator,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge as SharedStatusBadge,
  Textarea,
} from '@/shared/ui'

import { createTask, updateWorkspaceTask } from '../../../domain/services/taskWorkspaceService'
import { getTaskStatusSelectionOptions } from '../../../domain/policies/taskPolicy'
import { USER_ROLES } from '../../../entities/profile'
import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import {
  TaskMarkdownImportModal,
  applyTaskMarkdownImport,
  previewTaskMarkdownImport,
} from '../../../features/tasks/import-task-markdown'
import { TaskMarkdownExportModal } from '../../../features/tasks/export-task-markdown'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { getTeamTaskFilterPath, loadTeamTasks, normalizeTeamTaskFilters } from './teamTaskFilterState'
import { TaskFilters } from './teamTaskFilters'

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

function createUuid() {
  return crypto.randomUUID()
}

function getTaskWorkspacePath(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN ? '/admin/tasks' : '/team/tasks'
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

function getTaskDayDifference(date) {
  if (!date) {
    return Number.POSITIVE_INFINITY
  }

  const dueDate = new Date(date)

  if (Number.isNaN(dueDate.getTime())) {
    return Number.POSITIVE_INFINITY
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  return Math.round((dueDate.getTime() - today.getTime()) / 86_400_000)
}

function isAttentionTask(task) {
  return Boolean(task.blockerNote)
    || task.status === TASK_STATUSES.BLOCKED
    || task.status === TASK_STATUSES.WAITING_CLIENT
}

function VisibilityInline({ visibility }) {
  const isClientVisible = visibility === VISIBILITY.CLIENT_VISIBLE

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <Icon name={isClientVisible ? 'user' : 'lock'} size={13} />
      {isClientVisible ? 'Client visible' : 'Internal'}
    </span>
  )
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

function TaskRow({ isSelected = false, onOpenTask, task }) {
  return (
    <article className="border-t border-separator first:border-t-0">
      <button
        className={`w-full px-card py-component text-left transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover ${
          isSelected ? 'bg-fill-secondary' : ''
        }`}
        onClick={() => onOpenTask(task.id)}
        type="button"
      >
        <div className="flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Icon
                className={isAttentionTask(task) ? 'text-destructive' : 'text-text-quaternary'}
                name={isAttentionTask(task) ? 'triangleAlert' : TASK_STATUS_META[task.status]?.icon ?? 'circle'}
                size={16}
              />
              <h2 className="text-base font-semibold text-text-primary">{task.title}</h2>
            </div>
            {task.blockerNote ? (
              <p className="mt-2 line-clamp-1 text-sm leading-6 text-destructive">
                {task.blockerNote}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
              <span>{task.clientName}</span>
              <span>{task.projectName}</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={14} />
                {formatTaskDueDate(task.dueDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="user" size={14} />
                {task.assigneeName || 'Unassigned'}
              </span>
              <VisibilityInline visibility={task.visibility} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 lg:justify-end">
            <StatusBadge status={task.status} />
          </div>
        </div>
      </button>
    </article>
  )
}

function TaskSection({ emptyText, onOpenTask, selectedTaskId, tasks, title }) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-block bg-block">
      <div className="flex items-center justify-between gap-component px-card py-component">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <span className="text-label text-text-muted">{tasks.length}</span>
      </div>
      <div>
        {tasks.map((task) => (
          <TaskRow
            isSelected={selectedTaskId === task.id}
            key={task.id}
            onOpenTask={onOpenTask}
            task={task}
          />
        ))}
      </div>
      {emptyText ? <p className="text-sm text-text-muted">{emptyText}</p> : null}
    </section>
  )
}

function TeamTaskInbox({ onOpenTask, selectedTaskId, tasks }) {
  const openTasks = tasks.filter((task) => task.status !== TASK_STATUSES.DONE)
  const doneTasks = tasks.filter((task) => task.status === TASK_STATUSES.DONE)
  const attentionTasks = openTasks.filter(isAttentionTask)
  const todayTasks = openTasks.filter((task) => !isAttentionTask(task) && getTaskDayDifference(task.dueDate) <= 0)
  const upcomingTasks = openTasks.filter((task) => !isAttentionTask(task) && getTaskDayDifference(task.dueDate) > 0)

  return (
    <div className="grid gap-section">
      <TaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={attentionTasks} title="Needs attention" />
      <TaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={todayTasks} title="Today" />
      <TaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={upcomingTasks} title="Upcoming" />
      <TaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={doneTasks} title="Done" />
    </div>
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
    <div className="px-card py-card">
      <div className="grid gap-panel">
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

function TaskDetailPanel({
  draft,
  error,
  isDirty,
  onChange,
  onClose,
  onReset,
  onSave,
  saveState,
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
            <h2 className="min-w-0 text-base font-semibold text-text-primary">{task.title}</h2>
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
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
            <span>{task.clientName}</span>
            <span>{task.projectName}</span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={14} />
              {formatTaskDueDate(task.dueDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="user" size={14} />
              {task.assigneeName || 'Unassigned'}
            </span>
            <VisibilityInline visibility={task.visibility} />
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <TaskDetailsContent
            draft={draft}
            error={error}
            onChange={onChange}
            task={task}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-separator px-card py-component sm:flex-row sm:items-center sm:justify-between">
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

function createBlankTaskDraft({ clients, routeClientId, viewer }) {
  const clientId = clients.some((client) => client.id === routeClientId)
    ? routeClientId
    : clients[0]?.id ?? ''

  return {
    assigneeName: viewer.role === USER_ROLES.AGENCY_TEAM ? viewer.name : '',
    clientId,
    clientSafeSummary: '',
    description: '',
    dueDate: '',
    internalNote: '',
    projectId: '',
    status: TASK_STATUSES.TODO,
    title: '',
    visibility: VISIBILITY.INTERNAL,
  }
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-xs font-medium text-destructive">{children}</p>
}

function CreateTaskDialog({
  error,
  filters,
  isOpen,
  onChange,
  onClose,
  onSubmit,
  saveState,
  taskData,
  taskDraft,
  viewer,
}) {
  const selectedClientProjects = taskData.projects
    .filter((project) => project.client_id === taskDraft.clientId)
  const canCreateClientVisibleTasks = taskData.canCreateClientVisibleTasks

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        <form className="grid max-h-overlay min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={onSubmit}>
          <OverlayHeader className="pr-control-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text-primary">New Task</DialogTitle>
              <DialogDescription className="sr-only">
                Create a new task.
              </DialogDescription>
            </DialogHeader>
          </OverlayHeader>
          <OverlayBody className="min-h-0 overflow-y-auto p-panel">
            <div className="mx-auto grid max-w-form gap-panel">
              <label className="grid gap-2">
                <Label htmlFor="task-title">Task title</Label>
                <Input
                  autoFocus
                  id="task-title"
                  onChange={(event) => onChange({ ...taskDraft, title: event.target.value })}
                  placeholder="e.g. QA new landing page tracking"
                  required
                  value={taskDraft.title}
                />
              </label>

              <div className="grid gap-component sm:grid-cols-2">
                <label className="grid gap-2">
                  <Label>Client</Label>
                  <Select
                    onValueChange={(clientId) => onChange({
                      ...taskDraft,
                      clientId,
                      projectId: '',
                    })}
                    value={taskDraft.clientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskData.clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="grid gap-2">
                  <Label>Project</Label>
                  <Select
                    onValueChange={(projectId) => onChange({
                      ...taskDraft,
                      projectId: projectId === 'none' ? '' : projectId,
                    })}
                    value={taskDraft.projectId || 'none'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {selectedClientProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <div className="grid gap-component sm:grid-cols-2">
                <label className="grid gap-2">
                  <Label>Assignee</Label>
                  <Input
                    disabled={viewer.role === USER_ROLES.AGENCY_TEAM}
                    onChange={(event) => onChange({ ...taskDraft, assigneeName: event.target.value })}
                    placeholder="Unassigned"
                    value={taskDraft.assigneeName}
                  />
                </label>

                <label className="grid gap-2">
                  <Label htmlFor="task-due-date">Due date</Label>
                  <Input
                    id="task-due-date"
                    onChange={(event) => onChange({ ...taskDraft, dueDate: event.target.value })}
                    type="date"
                    value={taskDraft.dueDate}
                  />
                </label>
              </div>

              <div className="grid gap-component sm:grid-cols-2">
                <label className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    onValueChange={(status) => onChange({ ...taskDraft, status })}
                    value={taskDraft.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TASK_STATUSES).map((status) => (
                        <SelectItem key={status} value={status}>{TASK_STATUS_META[status].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="grid gap-2">
                  <Label>Visibility</Label>
                  {canCreateClientVisibleTasks ? (
                    <Select
                      onValueChange={(visibility) => onChange({ ...taskDraft, visibility })}
                      value={taskDraft.visibility}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
                        <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client visible</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex h-target items-center gap-2 rounded-control bg-control px-component text-sm text-text-secondary">
                      <Icon name="lock" size={15} />
                      Internal
                    </div>
                  )}
                </label>
              </div>

              <label className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  className={`${taskFieldTextareaClass} min-h-24`}
                  id="task-description"
                  onChange={(event) => onChange({ ...taskDraft, description: event.target.value })}
                  placeholder="Context for the person doing the work."
                  value={taskDraft.description}
                />
              </label>

              <label className="grid gap-2">
                <Label htmlFor="task-internal-note">Internal note</Label>
                <Textarea
                  className={`${taskFieldTextareaClass} min-h-24`}
                  id="task-internal-note"
                  onChange={(event) => onChange({ ...taskDraft, internalNote: event.target.value })}
                  placeholder="Private agency context."
                  value={taskDraft.internalNote}
                />
              </label>

              {filters.visibility === VISIBILITY.CLIENT_VISIBLE && !canCreateClientVisibleTasks ? (
                <p className="rounded-control bg-control px-component py-control text-sm text-text-secondary">
                  Team-created tasks are saved as internal and can be made client-visible by an admin.
                </p>
              ) : null}
            </div>
          </OverlayBody>
          <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-sm">
              <FieldError>{error}</FieldError>
              {!error && saveState ? <span className="text-text-muted">{saveState}</span> : null}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={onClose} size="lg" type="button" variant="outline">
                Cancel
              </Button>
              <Button icon={<Icon name="plus" size={15} />} size="lg" type="submit">
                Create Task
              </Button>
            </div>
          </OverlayFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TeamTasksPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [reloadTick, setReloadTick] = useState(0)
  const filters = useMemo(() => normalizeTeamTaskFilters(routeParams), [routeParams])
  const basePath = getTaskWorkspacePath(runtime.viewer)
  const isCreateTaskOpen = routeParams.create === '1'
  const isExportTaskOpen = routeParams.export === '1'
  const isImportTaskOpen = routeParams.import === '1'
  const taskData = useMemo(() => {
    void reloadTick
    return loadTeamTasks(filters, runtime)
  }, [filters, reloadTick, runtime])
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const selectedTask = useMemo(
    () => taskData.tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, taskData.tasks],
  )
  const [taskDraft, setTaskDraft] = useState(() => createTaskDraft(selectedTask))
  const [taskCreationDraft, setTaskCreationDraft] = useState(() => createBlankTaskDraft({
    clients: taskData.clients,
    routeClientId: filters.clientId,
    viewer: runtime.viewer,
  }))
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('')
  const [createTaskError, setCreateTaskError] = useState('')
  const [createTaskSaveState, setCreateTaskSaveState] = useState('')
  const [importError, setImportError] = useState('')
  const [importPlan, setImportPlan] = useState(null)
  const [importSaveState, setImportSaveState] = useState('')
  const isTaskDetailsDirty = isTaskDraftChanged(selectedTask, taskDraft)

  function selectTask(taskId) {
    if (isTaskDetailsDirty && taskId !== selectedTask?.id) {
      setError('')
      setSaveState('Save or reset changes before selecting another task.')
      return
    }

    const task = taskData.tasks.find((item) => item.id === taskId) ?? null
    setSelectedTaskId(taskId)
    setTaskDraft(createTaskDraft(task))
    setError('')
    setSaveState('')
  }

  function closeTaskDetails() {
    if (isTaskDetailsDirty) {
      setError('')
      setSaveState('Save or reset changes before closing task details.')
      return
    }

    setSelectedTaskId('')
    setTaskDraft(null)
    setError('')
    setSaveState('')
  }

  function resetTaskDraft() {
    setTaskDraft(createTaskDraft(selectedTask))
    setError('')
    setSaveState('')
  }

  function saveTaskUpdate() {
    try {
      if (!selectedTask || !taskDraft) {
        return
      }

      if (taskDraft?.status === TASK_STATUSES.BLOCKED && !taskDraft.blockerNote.trim()) {
        setError('Blocker reason is required.')
        setSaveState('')
        toast.warning('Blocker reason required', 'Add a short note before marking this task as blocked.')
        return
      }

      updateWorkspaceTask({
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

  function closeCreateTask() {
    setCreateTaskError('')
    setCreateTaskSaveState('')
    navigate(getTeamTaskFilterPath(filters, basePath), { replace: true })
  }

  function closeTaskImport() {
    setImportError('')
    setImportPlan(null)
    setImportSaveState('')
    navigate(getTeamTaskFilterPath(filters, basePath), { replace: true })
  }

  function closeTaskExport() {
    navigate(getTeamTaskFilterPath(filters, basePath), { replace: true })
  }

  function saveNewTask(event) {
    event.preventDefault()
    setCreateTaskError('')
    setCreateTaskSaveState('Creating task...')

    runtime.dataClient.write((repositories) => createTask({
      idGenerator: createUuid,
      input: taskCreationDraft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdTask) => {
        setCreateTaskSaveState('')
        setReloadTick((currentTick) => currentTick + 1)
        toast.success('Task created', `${createdTask.title} was added to Tasks.`)
        closeCreateTask()
      })
      .catch((caughtError) => {
        setCreateTaskError(caughtError.message)
        setCreateTaskSaveState('')
        toast.error('Task was not created', caughtError.message)
      })
  }

  function previewTaskImport(input) {
    try {
      const nextPlan = previewTaskMarkdownImport({
        ...input,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })

      setImportPlan(nextPlan)
      setImportError('')
      setImportSaveState('Preview is ready.')
    } catch (caughtError) {
      setImportPlan(null)
      setImportError(caughtError.message)
      setImportSaveState('')
      toast.error('Import preview failed', caughtError.message)
    }
  }

  function clearTaskImportPreview() {
    setImportError('')
    setImportPlan(null)
    setImportSaveState('')
  }

  function applyTaskImport() {
    if (!importPlan) {
      return
    }

    setImportError('')
    setImportSaveState('Creating tasks...')

    runtime.dataClient.write((repositories) => applyTaskMarkdownImport({
      idGenerator: createUuid,
      preview: importPlan,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdTasks) => {
        setImportSaveState('')
        setReloadTick((currentTick) => currentTick + 1)
        toast.success('Tasks imported', `${createdTasks.length} tasks were created.`)
        closeTaskImport()
      })
      .catch((caughtError) => {
        setImportError(caughtError.message)
        setImportSaveState('')
        toast.error('Task import failed', caughtError.message)
      })
  }

  const hasFilters = Object.entries(filters).some(([key, value]) => (
    key === 'search' ? Boolean(value) : key !== 'scope' && value !== 'all'
  ))

  function updateTaskDraft(nextDraft) {
    setTaskDraft(nextDraft)
    setError('')
    setSaveState('')
  }

  return (
    <PageShell>
      <div className={`grid items-start gap-card ${selectedTask ? 'xl:grid-cols-inspector' : ''}`}>
        <div className="grid min-w-0 gap-card">
          <ContentToolbar className="rounded-none bg-transparent p-0">
            <TaskFilters
              filters={filters}
              onChange={(nextFilters) => navigate(getTeamTaskFilterPath(nextFilters, basePath))}
              taskData={taskData}
            />
          </ContentToolbar>
          {taskData.tasks.length > 0 ? (
            <TeamTaskInbox
              onOpenTask={selectTask}
              selectedTaskId={selectedTask?.id}
              tasks={taskData.tasks}
            />
          ) : (
            <EmptyTasksState hasFilters={hasFilters} />
          )}
        </div>
        {selectedTask ? (
          <TaskDetailPanel
            draft={taskDraft}
            error={error}
            isDirty={isTaskDetailsDirty}
            onChange={updateTaskDraft}
            onClose={closeTaskDetails}
            onReset={resetTaskDraft}
            onSave={saveTaskUpdate}
            saveState={saveState}
            task={selectedTask}
          />
        ) : null}
      </div>
      <CreateTaskDialog
        error={createTaskError}
        filters={filters}
        isOpen={isCreateTaskOpen}
        onChange={(nextDraft) => {
          setTaskCreationDraft(nextDraft)
          setCreateTaskError('')
          setCreateTaskSaveState('')
        }}
        onClose={closeCreateTask}
        onSubmit={saveNewTask}
        saveState={createTaskSaveState}
        taskData={taskData}
        taskDraft={taskCreationDraft}
        viewer={runtime.viewer}
      />
      <TaskMarkdownImportModal
        clients={taskData.clients}
        defaultClientId={filters.clientId === 'all' ? taskData.clients[0]?.id : filters.clientId}
        importError={importError}
        importPlan={importPlan}
        isOpen={isImportTaskOpen}
        onApply={applyTaskImport}
        onClose={closeTaskImport}
        onInvalidatePreview={clearTaskImportPreview}
        onPreview={previewTaskImport}
        projects={taskData.projects}
        saveState={importSaveState}
      />
      <TaskMarkdownExportModal
        isOpen={isExportTaskOpen}
        onClose={closeTaskExport}
        tasks={taskData.tasks}
        title={filters.clientId === 'all' ? 'Tasks' : `${taskData.clients.find((client) => client.id === filters.clientId)?.name ?? 'Client'} Tasks`}
      />
    </PageShell>
  )
}
