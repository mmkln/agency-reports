import { CardContent, PrimitiveCard as Card } from '@/shared/ui'
import { Icon } from '@/shared/icons'
import {
  formatTaskDueDate,
  getTaskStatusMeta,
  isTaskAttentionNeeded,
  TASK_STATUSES,
} from '@/entities/task'
import {
  TaskMetaRow,
  TaskStatusBadge,
} from '@/entities/task/ui'

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

export function EmptyTasksState({ hasFilters }) {
  return (
    <Card className="border-control-border bg-block shadow-none">
      <CardContent className="flex min-h-[260px] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-control text-text-quaternary">
            <Icon name="checkCircle2" size={30} />
          </div>
          <h2 className="mt-5 text-ui text-text-primary">
            {hasFilters ? 'No tasks match these filters' : 'No assigned tasks right now'}
          </h2>
          <p className="mt-2 text-body text-text-muted">
            {hasFilters
              ? 'Adjust the filters to see more operational work.'
              : 'Assigned client work will appear here when tasks are created.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamTaskRow({ isSelected = false, onOpenTask, task }) {
  const statusMeta = getTaskStatusMeta(task.status)
  const needsAttention = isTaskAttentionNeeded(task)

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
                className={needsAttention ? 'text-destructive' : 'text-text-quaternary'}
                name={needsAttention ? 'triangleAlert' : statusMeta.icon}
                size={16}
              />
              <h2 className="text-ui text-text-primary">{task.title}</h2>
            </div>
            {task.blockerNote ? (
              <p className="mt-2 line-clamp-1 text-body text-destructive">
                {task.blockerNote}
              </p>
            ) : null}
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
          <div className="flex shrink-0 items-center gap-3 lg:justify-end">
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      </button>
    </article>
  )
}

function TeamTaskSection({ emptyText, onOpenTask, selectedTaskId, tasks, title }) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-block bg-block">
      <div className="flex items-center justify-between gap-component px-card py-component">
        <h2 className="text-ui text-text-primary">{title}</h2>
        <span className="text-label text-text-muted">{tasks.length}</span>
      </div>
      <div>
        {tasks.map((task) => (
          <TeamTaskRow
            isSelected={selectedTaskId === task.id}
            key={task.id}
            onOpenTask={onOpenTask}
            task={task}
          />
        ))}
      </div>
      {emptyText ? <p className="text-ui text-text-muted">{emptyText}</p> : null}
    </section>
  )
}

export function TeamTaskInbox({ onOpenTask, selectedTaskId, tasks }) {
  const openTasks = tasks.filter((task) => task.status !== TASK_STATUSES.DONE)
  const doneTasks = tasks.filter((task) => task.status === TASK_STATUSES.DONE)
  const attentionTasks = openTasks.filter(isTaskAttentionNeeded)
  const todayTasks = openTasks.filter((task) => !isTaskAttentionNeeded(task) && getTaskDayDifference(task.dueDate) <= 0)
  const upcomingTasks = openTasks.filter((task) => !isTaskAttentionNeeded(task) && getTaskDayDifference(task.dueDate) > 0)

  return (
    <div className="grid gap-section">
      <TeamTaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={attentionTasks} title="Needs attention" />
      <TeamTaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={todayTasks} title="Today" />
      <TeamTaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={upcomingTasks} title="Upcoming" />
      <TeamTaskSection onOpenTask={onOpenTask} selectedTaskId={selectedTaskId} tasks={doneTasks} title="Done" />
    </div>
  )
}
