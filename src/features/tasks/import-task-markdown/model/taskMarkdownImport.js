import { createTask, listTaskWorkspace } from '../../../../domain/services/taskWorkspaceService'
import { TASK_STATUSES } from '../../../../entities/task'
import { VISIBILITY } from '../../../../entities/update'

export const TASK_IMPORT_PARTIAL_POLICIES = Object.freeze({
  FILL_MISSING: 'fill_missing',
  SKIP_INCOMPLETE: 'skip_incomplete',
})

const DEFAULT_COLUMN_TITLE = 'Imported'

function stripFrontMatter(rawMarkdown) {
  const markdown = String(rawMarkdown ?? '').replace(/\r\n/g, '\n')

  if (!markdown.startsWith('---\n')) {
    return markdown
  }

  const closingIndex = markdown.indexOf('\n---', 4)

  if (closingIndex === -1) {
    return markdown
  }

  return markdown.slice(closingIndex + 4).trimStart()
}

function normalizeLine(value) {
  return String(value ?? '').trim()
}

function stripMarkdownFormatting(value) {
  return normalizeLine(value)
    .replace(/^\*\*(.*)\*\*$/, '$1')
    .replace(/^__(.*)__$/, '$1')
    .trim()
}

function createColumn(title, inferred = false) {
  return {
    cards: [],
    inferred,
    title,
  }
}

function pushWarning(warnings, message, line = null) {
  warnings.push({
    line,
    message,
  })
}

function getFallbackTitle(prefix, index) {
  return `${prefix} ${index}`
}

function parseChecklistItem(line) {
  const match = line.match(/^[-*+]\s+(?:\[(x|X| )\]\s*)?(.*)$/)

  if (!match) {
    return null
  }

  return {
    checked: match[1] ? match[1].toLowerCase() === 'x' : false,
    title: stripMarkdownFormatting(match[2]),
  }
}

function parseHeading(line) {
  const match = line.match(/^(#{1,6})\s+(.+)$/)

  if (!match) {
    return null
  }

  return {
    level: match[1].length,
    title: stripMarkdownFormatting(match[2]),
  }
}

function ensureColumn(columns, warnings) {
  if (columns.length > 0) {
    return columns[columns.length - 1]
  }

  const column = createColumn(DEFAULT_COLUMN_TITLE, true)
  columns.push(column)
  pushWarning(warnings, 'Tasks without a status heading were placed in an inferred Imported column.')
  return column
}

function shouldSkipMissingTitle(policy) {
  return policy === TASK_IMPORT_PARTIAL_POLICIES.SKIP_INCOMPLETE
}

function parseTaskMarkdownImport(rawMarkdown, options = {}) {
  const partialPolicy = options.partialPolicy ?? TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING
  const warnings = []
  const columns = []
  const lines = stripFrontMatter(rawMarkdown).split('\n')
  let pendingCard = null
  let cardFallbackIndex = 1
  let columnFallbackIndex = 1

  function finishPendingCard() {
    if (!pendingCard) {
      return
    }

    pendingCard.description = pendingCard.descriptionLines.join('\n').trim()
    delete pendingCard.descriptionLines
    ensureColumn(columns, warnings).cards.push(pendingCard)
    pendingCard = null
  }

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = normalizeLine(rawLine)

    if (!line) {
      if (pendingCard) {
        pendingCard.descriptionLines.push('')
      }
      return
    }

    if (/^#{1,6}$/.test(line)) {
      finishPendingCard()
      pushWarning(warnings, 'Skipped a heading without a title.', lineNumber)
      return
    }

    const heading = parseHeading(line)

    if (heading) {
      finishPendingCard()

      if (heading.level === 1) {
        return
      }

      if (heading.level === 2) {
        const title = heading.title || getFallbackTitle('Untitled status', columnFallbackIndex++)

        if (!heading.title && shouldSkipMissingTitle(partialPolicy)) {
          pushWarning(warnings, 'Skipped a status heading without a title.', lineNumber)
          return
        }

        columns.push(createColumn(title, !heading.title))
        return
      }

      const cardTitle = heading.title || getFallbackTitle('Untitled task', cardFallbackIndex++)

      if (!heading.title && shouldSkipMissingTitle(partialPolicy)) {
        pushWarning(warnings, 'Skipped a task heading without a title.', lineNumber)
        return
      }

      pendingCard = {
        checked: false,
        descriptionLines: [],
        inferred: !heading.title,
        title: cardTitle,
      }
      return
    }

    const checklistItem = parseChecklistItem(line)

    if (checklistItem) {
      finishPendingCard()

      const cardTitle = checklistItem.title || getFallbackTitle('Untitled task', cardFallbackIndex++)

      if (!checklistItem.title && shouldSkipMissingTitle(partialPolicy)) {
        pushWarning(warnings, 'Skipped a checklist item without a title.', lineNumber)
        return
      }

      pendingCard = {
        checked: checklistItem.checked,
        descriptionLines: [],
        inferred: !checklistItem.title,
        title: cardTitle,
      }
      return
    }

    if (pendingCard) {
      pendingCard.descriptionLines.push(rawLine.trim())
      return
    }

    pendingCard = {
      checked: false,
      descriptionLines: [rawLine.trim()],
      inferred: true,
      title: getFallbackTitle('Untitled task', cardFallbackIndex++),
    }
    pushWarning(warnings, 'Created an inferred task for loose text.', lineNumber)
  })

  finishPendingCard()

  return {
    payload: {
      columns,
      format: 'markdown',
      version: 1,
    },
    warnings,
  }
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase()
}

function mapColumnTitleToStatus(title) {
  const normalizedTitle = normalizeKey(title)

  if (normalizedTitle.includes('done') || normalizedTitle.includes('complete')) {
    return TASK_STATUSES.DONE
  }

  if (normalizedTitle.includes('block')) {
    return TASK_STATUSES.BLOCKED
  }

  if (normalizedTitle.includes('waiting') || normalizedTitle.includes('client')) {
    return TASK_STATUSES.WAITING_CLIENT
  }

  if (normalizedTitle.includes('progress') || normalizedTitle.includes('doing')) {
    return TASK_STATUSES.IN_PROGRESS
  }

  return TASK_STATUSES.TODO
}

function createCounts() {
  return {
    conflict: 0,
    create: 0,
    skip: 0,
    update: 0,
  }
}

function addPlanItem(plan, item) {
  plan.counts[item.action] += 1
  plan.items.push(item)
}

function getWorkspaceData({ repositories, viewer }) {
  return listTaskWorkspace({
    repositories,
    viewer,
  })
}

function resolveClient({ clientId, repositories, viewer }) {
  const workspaceData = getWorkspaceData({ repositories, viewer })
  const client = workspaceData.clients.find((workspaceClient) => workspaceClient.id === clientId)

  if (!client) {
    throw new Error('Select an available client before previewing the import.')
  }

  return {
    client,
    workspaceData,
  }
}

function resolveProject({ clientId, projectId, workspaceData }) {
  if (!projectId || projectId === 'none') {
    return ''
  }

  const project = workspaceData.projects.find((workspaceProject) => (
    workspaceProject.id === projectId && workspaceProject.client_id === clientId
  ))

  if (!project) {
    throw new Error('Project is not available for the selected client.')
  }

  return project.id
}

function createTaskDraftsFromPayload({ clientId, projectId, payload }) {
  return payload.columns.flatMap((column) => {
    const status = mapColumnTitleToStatus(column.title)

    return column.cards.map((card) => ({
      clientId,
      description: card.description,
      internalNote: column.inferred ? 'Imported from Markdown.' : `Imported from Markdown column: ${column.title}`,
      projectId,
      sourceColumn: column.title,
      status: card.checked ? TASK_STATUSES.DONE : status,
      title: card.title,
      visibility: VISIBILITY.INTERNAL,
    }))
  })
}

export function previewTaskMarkdownImport({
  clientId,
  partialPolicy = TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING,
  projectId = '',
  rawMarkdown,
  repositories,
  viewer,
}) {
  const { workspaceData } = resolveClient({
    clientId,
    repositories,
    viewer,
  })
  const resolvedProjectId = resolveProject({
    clientId,
    projectId,
    workspaceData,
  })
  const parsedImport = parseTaskMarkdownImport(rawMarkdown, {
    partialPolicy,
  })
  const taskDrafts = createTaskDraftsFromPayload({
    clientId,
    payload: parsedImport.payload,
    projectId: resolvedProjectId,
  })
  const existingTasksByTitle = new Set(
    repositories.tasks
      .listByWorkspaceId(clientId)
      .filter((task) => (resolvedProjectId ? task.project_id === resolvedProjectId : true))
      .map((task) => normalizeKey(task.title)),
  )
  const plan = {
    clientId,
    counts: createCounts(),
    items: [],
    partialPolicy,
    projectId: resolvedProjectId,
    rawMarkdown,
    taskDrafts,
    warnings: parsedImport.warnings,
  }
  const seenImportTitles = new Set()

  taskDrafts.forEach((taskDraft, draftIndex) => {
    const titleKey = normalizeKey(taskDraft.title)

    if (existingTasksByTitle.has(titleKey)) {
      addPlanItem(plan, {
        action: 'skip',
        detail: 'A task with this title already exists for the selected client and project.',
        draftIndex,
        label: taskDraft.title,
        sourceColumn: taskDraft.sourceColumn,
        status: taskDraft.status,
        type: 'task',
      })
      return
    }

    if (seenImportTitles.has(titleKey)) {
      addPlanItem(plan, {
        action: 'skip',
        detail: 'A matching task title already appears earlier in this import.',
        draftIndex,
        label: taskDraft.title,
        sourceColumn: taskDraft.sourceColumn,
        status: taskDraft.status,
        type: 'task',
      })
      return
    }

    seenImportTitles.add(titleKey)
    addPlanItem(plan, {
      action: 'create',
      detail: `Task will be created as ${taskDraft.status.replaceAll('_', ' ')}.`,
      draftIndex,
      label: taskDraft.title,
      sourceColumn: taskDraft.sourceColumn,
      status: taskDraft.status,
      type: 'task',
    })
  })

  if (plan.items.length === 0) {
    addPlanItem(plan, {
      action: 'skip',
      detail: 'No task checklist items or card headings were detected.',
      label: 'Nothing to import',
      type: 'empty',
    })
  }

  return plan
}

export function applyTaskMarkdownImport({
  idGenerator,
  now,
  preview,
  repositories,
  viewer,
}) {
  const createItems = preview.items.filter((item) => item.action === 'create')
  const createDraftIndexes = new Set(createItems.map((item) => item.draftIndex))

  return preview.taskDrafts
    .filter((taskDraft, draftIndex) => createDraftIndexes.has(draftIndex))
    .map((taskDraft) => createTask({
      idGenerator,
      input: taskDraft,
      now,
      repositories,
      viewer,
    }))
}
