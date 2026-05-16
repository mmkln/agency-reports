import { TASK_STATUSES, TASK_STATUS_META } from '../../../../entities/task'

const STATUS_EXPORT_ORDER = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.WAITING_CLIENT,
  TASK_STATUSES.BLOCKED,
  TASK_STATUSES.DONE,
]

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function escapeTaskTitle(value) {
  return normalizeText(value).replace(/\n+/g, ' ')
}

function formatDescription(description) {
  const normalizedDescription = normalizeText(description)

  if (!normalizedDescription) {
    return []
  }

  return normalizedDescription.split('\n').map((line) => `  ${line.trim()}`)
}

function getStatusLabel(status) {
  return TASK_STATUS_META[status]?.label ?? status
}

function groupTasksByStatus(tasks) {
  const groups = new Map(STATUS_EXPORT_ORDER.map((status) => [status, []]))

  tasks.forEach((task) => {
    const status = task.status && groups.has(task.status) ? task.status : TASK_STATUSES.TODO
    groups.get(status).push(task)
  })

  return groups
}

export function exportTasksToMarkdown({
  title = 'Tasks',
  tasks = [],
}) {
  const lines = [
    '---',
    `title: ${escapeTaskTitle(title)}`,
    'format: agency-reports-tasks',
    '---',
    '',
    `# ${escapeTaskTitle(title)}`,
  ]
  const groups = groupTasksByStatus(tasks)

  STATUS_EXPORT_ORDER.forEach((status) => {
    const statusTasks = groups.get(status)

    if (!statusTasks.length) {
      return
    }

    lines.push('', `## ${getStatusLabel(status)}`)

    statusTasks.forEach((task) => {
      const checked = task.status === TASK_STATUSES.DONE ? 'x' : ' '
      lines.push(`- [${checked}] ${escapeTaskTitle(task.title)}`)
      lines.push(...formatDescription(task.description))
    })
  })

  if (tasks.length === 0) {
    lines.push('', '## To Do', '- [ ] No tasks to export')
  }

  return `${lines.join('\n')}\n`
}
