import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  getAdminClientOverviewEditor,
  publishAdminClientOverview,
  saveAdminClientOverview,
} from '../../../domain/services/adminOverviewService'
import { CLIENT_STATUSES, CLIENT_STATUS_META } from '../../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import { REPORT_STATUSES } from '../../../entities/report'
import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import { ConfirmationDialog } from '../../../shared/ui'
import {
  createBlankDashboardLink,
  createBlankNeededAction,
  createBlankProject,
  createBlankReport,
  createBlankTask,
  createBlankUpdate,
  createDraft,
  removeListItem,
  updateListItem,
} from '../model'

const statusOptions = [
  CLIENT_STATUSES.ON_TRACK,
  CLIENT_STATUSES.NEEDS_ATTENTION,
  CLIENT_STATUSES.WAITING_CLIENT,
  CLIENT_STATUSES.BLOCKED,
]

const statusDescriptions = {
  [CLIENT_STATUSES.ON_TRACK]: 'Work is progressing normally.',
  [CLIENT_STATUSES.NEEDS_ATTENTION]: 'Something needs review.',
  [CLIENT_STATUSES.WAITING_CLIENT]: 'Waiting for client action/approval.',
  [CLIENT_STATUSES.BLOCKED]: 'Work cannot move forward.',
}

const statusOptionStyles = {
  [CLIENT_STATUSES.ON_TRACK]: {
    active: 'bg-emerald-50/80 text-emerald-950',
    icon: 'checkCircle2',
    iconClassName: 'text-emerald-600',
  },
  [CLIENT_STATUSES.NEEDS_ATTENTION]: {
    active: 'bg-amber-50/80 text-amber-950',
    icon: 'warning',
    iconClassName: 'text-amber-600',
  },
  [CLIENT_STATUSES.WAITING_CLIENT]: {
    active: 'bg-fuchsia-50/80 text-fuchsia-950',
    icon: 'clock',
    iconClassName: 'text-fuchsia-600',
  },
  [CLIENT_STATUSES.BLOCKED]: {
    active: 'bg-rose-50/80 text-rose-950',
    icon: 'close',
    iconClassName: 'text-rose-600',
  },
}

const toneClasses = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
}

function createUuid() {
  return crypto.randomUUID()
}

function loadEditor(clientId, runtime) {
  return getAdminClientOverviewEditor({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}

function createInitialPageState(clientId, runtime) {
  try {
    const editor = loadEditor(clientId, runtime)

    return {
      draft: createDraft(editor),
      editor,
      error: '',
    }
  } catch (caughtError) {
    return {
      draft: null,
      editor: null,
      error: caughtError.message,
    }
  }
}

function formatDate(date) {
  if (!date) {
    return 'Not published yet'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || 'CL'
}

function StatusBadge({ status }) {
  const meta = CLIENT_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }

  return (
    <Badge className={toneClasses[meta.tone]} variant="outline">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}

function EditorCard({ action, children, description, iconName, title }) {
  return (
    <Card className="gap-0 border-slate-200 bg-white py-0 shadow-xs">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {iconName ? <Icon className="text-slate-400" name={iconName} size={15} /> : null}
              {title}
            </CardTitle>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

function EditorPageHeader({
  draft,
  editor,
  isDirty,
  onPublish,
  onSave,
  saveState,
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700">
              {getInitials(editor.client.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl leading-7 font-bold text-slate-900 transition-all sm:text-3xl sm:tracking-tight">
                  {editor.client.name}
                </h1>
                <StatusBadge status={draft.client.status} />
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                agency.com/{editor.client.portalSlug}
                <Icon name="arrowUpRight" size={12} />
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="text-xs leading-4 md:text-right">
              <p className={isDirty ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'}>
                {saveState || (isDirty ? 'Unsaved changes' : 'All changes saved')}
              </p>
              <p className="text-slate-400">Last published: {formatDate(editor.client.overviewPublishedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button asChild size="lg" variant="outline">
                <a href={`#admin-client-preview?clientId=${editor.client.id}`}>
                  <Icon name="user" size={15} />
                  Preview as Client
                </a>
              </Button>
              <Button onClick={onSave} size="lg" type="button" variant="outline">
                Save Draft
              </Button>
              <Button onClick={onPublish} size="lg" type="button">
                <Icon name="zap" size={15} />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function AdminErrorState({ message }) {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="flex min-h-[280px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Icon name="shieldCheck" size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Client overview unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
          <Button asChild className="mt-5" variant="outline">
            <a href="#admin-clients">Back to clients</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LatestUpdateEditor({ draft, onUpdateUpdates }) {
  const update = draft.updates[0] ?? createBlankUpdate(draft.projects[0]?.id)
  const charCount = update.body?.length ?? 0

  function updateField(fieldName, value) {
    const nextUpdates = draft.updates.length > 0 ? [...draft.updates] : [update]
    nextUpdates[0] = {
      ...nextUpdates[0],
      [fieldName]: value,
    }
    onUpdateUpdates(nextUpdates)
  }

  return (
    <EditorCard
      action={(
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          Client Visible
          <Checkbox
            checked={update.visibility === VISIBILITY.CLIENT_VISIBLE}
            onCheckedChange={(checked) => updateField('visibility', checked ? VISIBILITY.CLIENT_VISIBLE : VISIBILITY.INTERNAL)}
          />
        </label>
      )}
      iconName="messageSquare"
      title="Latest Update"
    >
      <p className="mb-3 text-xs leading-5 text-slate-500">
        Write a short, human-readable update about what happened recently. This is the first thing the client reads.
      </p>
      <Textarea
        onChange={(event) => updateField('body', event.target.value)}
        placeholder="This week we launched..."
        value={update.body}
      />
      <p className="mt-2 text-xs text-slate-400">{charCount} characters</p>
    </EditorCard>
  )
}

function CurrentFocusEditor({ draft, onChange }) {
  const [newFocus, setNewFocus] = useState('')
  const activeItems = draft.currentFocus.filter((item) => item.trim())
  const canAdd = activeItems.length < 3 && newFocus.trim()

  function addFocus() {
    if (!canAdd) {
      return
    }

    onChange([...activeItems, newFocus.trim()])
    setNewFocus('')
  }

  return (
    <EditorCard
      action={<Badge className="bg-slate-100 text-slate-600" variant="outline">{activeItems.length}/3 items</Badge>}
      iconName="target"
      title="Current Focus"
    >
      <p className="mb-3 text-xs leading-5 text-slate-500">What are the 1-3 main directions the team is working on right now?</p>
      <div className="grid gap-2">
        {draft.currentFocus.map((focusItem, index) => (
          <div className="group flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2" key={index}>
            <Icon className="text-slate-300" name="grid" size={14} />
            <Input
              className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-0 shadow-none focus-visible:ring-0"
              onChange={(event) => onChange(draft.currentFocus.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              placeholder="e.g. Meta Ads campaign optimization"
              value={focusItem}
            />
            <button
              aria-label={`Remove focus item: ${focusItem || 'Untitled focus item'}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-300 opacity-70 transition hover:text-rose-500 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-none"
              onClick={() => onChange(draft.currentFocus.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              <Icon name="close" size={13} />
            </button>
          </div>
        ))}
        {activeItems.length < 3 ? (
          <div className="flex gap-2">
            <Input
              onChange={(event) => setNewFocus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addFocus()
                }
              }}
              placeholder="e.g. Meta Ads campaign optimization"
              value={newFocus}
            />
            <Button disabled={!canAdd} onClick={addFocus} type="button">Add</Button>
          </div>
        ) : null}
      </div>
    </EditorCard>
  )
}

function TasksManager({ draft, onAddTask, onRemoveTask, onUpdateTasks }) {
  return (
    <EditorCard
      action={(
        <Button onClick={onAddTask} size="sm" type="button" variant="ghost">
          <Icon name="plus" size={14} />
          New Task
        </Button>
      )}
      description="Control which tasks the client can see."
      iconName="checkCircle2"
      title="Tasks Manager"
    >
      <div className="-mx-4 -mb-4 overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Task / Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Client Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draft.tasks.map((task, index) => (
              <TableRow className="align-top" key={task.id || `task-${index}`}>
                <TableCell>
                  <Input
                    className="h-8 border-transparent bg-transparent px-0 font-medium shadow-none focus-visible:px-2 focus-visible:ring-0"
                    onChange={(event) => onUpdateTasks(updateListItem(draft.tasks, index, 'title', event.target.value))}
                    placeholder="Task title"
                    value={task.title}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Select
                      onValueChange={(value) => onUpdateTasks(updateListItem(draft.tasks, index, 'status', value))}
                      value={task.status}
                    >
                      <SelectTrigger className="h-7 w-[150px] text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                      {Object.values(TASK_STATUSES).map((status) => (
                          <SelectItem key={status} value={status}>{TASK_STATUS_META[status].label}</SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-7 w-28 px-2 text-xs"
                      onChange={(event) => onUpdateTasks(updateListItem(draft.tasks, index, 'assignee_name', event.target.value))}
                      placeholder="Owner"
                      value={task.assignee_name}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 w-auto px-2 text-xs"
                    onChange={(event) => onUpdateTasks(updateListItem(draft.tasks, index, 'due_date', event.target.value))}
                    type="date"
                    value={task.due_date}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      task.visibility === VISIBILITY.CLIENT_VISIBLE
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                    onClick={() => onUpdateTasks(updateListItem(
                      draft.tasks,
                      index,
                      'visibility',
                      task.visibility === VISIBILITY.CLIENT_VISIBLE ? VISIBILITY.INTERNAL : VISIBILITY.CLIENT_VISIBLE,
                    ))}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Icon name={task.visibility === VISIBILITY.CLIENT_VISIBLE ? 'user' : 'lock'} size={14} />
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    className="text-slate-400 hover:text-rose-600"
                    onClick={() => onRemoveTask(index)}
                    size="icon-sm"
                    title="Delete task"
                    type="button"
                    variant="ghost"
                  >
                    <Icon name="close" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-indigo-100 bg-indigo-50 px-4 py-2 text-xs text-indigo-700">
          Internal tasks (hidden) will not appear anywhere on the client's portal.
        </div>
      </div>
    </EditorCard>
  )
}

function NeededFromClientEditor({ draft, onAddAction, onRemoveAction, onUpdateNeededActions }) {
  return (
    <EditorCard
      action={(
        <Button className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100" onClick={onAddAction} size="sm" type="button" variant="outline">
          <Icon name="plus" size={14} />
          Add Request
        </Button>
      )}
      iconName="warning"
      title="Needed From Client"
    >
      <div className="grid gap-3">
        {draft.neededActions.map((action, index) => (
          <div className="grid gap-2 rounded-lg border border-orange-100 bg-orange-50/40 p-3" key={action.id || `needed-${index}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                onValueChange={(value) => onUpdateNeededActions(updateListItem(draft.neededActions, index, 'status', value))}
                value={action.status}
              >
                <SelectTrigger className="h-7 w-[145px] border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                {Object.values(NEEDED_ACTION_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
                </SelectContent>
              </Select>
              <Input
                className="h-8 w-auto border-transparent bg-transparent px-1 text-xs text-slate-500 shadow-none focus-visible:border-orange-200 focus-visible:bg-white focus-visible:ring-0"
                onChange={(event) => onUpdateNeededActions(updateListItem(draft.neededActions, index, 'due_date', event.target.value))}
                type="date"
                value={action.due_date}
              />
              <Button
                className="ml-auto text-slate-400 hover:text-rose-600"
                onClick={() => onRemoveAction(index)}
                size="icon-sm"
                title="Delete request"
                type="button"
                variant="ghost"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <Input
              className="h-8 border-transparent bg-transparent px-1 font-medium shadow-none focus-visible:border-orange-200 focus-visible:bg-white focus-visible:ring-0"
              onChange={(event) => onUpdateNeededActions(updateListItem(draft.neededActions, index, 'title', event.target.value))}
              placeholder="Approve creative batch #2"
              value={action.title}
            />
            <Textarea
              className="min-h-16 border-orange-100 bg-white/70 py-1 text-slate-600 focus-visible:border-orange-200"
              onChange={(event) => onUpdateNeededActions(updateListItem(draft.neededActions, index, 'description', event.target.value))}
              placeholder="Request details"
              value={action.description}
            />
          </div>
        ))}
      </div>
    </EditorCard>
  )
}

function ProjectStatusPanel({ draft, onSetStatus }) {
  return (
    <EditorCard iconName="barChart" title="Project Status">
      <div className="grid grid-cols-2 gap-2">
        {statusOptions.map((status) => {
          const meta = CLIENT_STATUS_META[status]
          const isActive = draft.client.status === status
          const styles = statusOptionStyles[status]

          return (
            <button
              aria-label={`${meta.label}: ${statusDescriptions[status]}`}
              aria-pressed={isActive}
              className={`group flex h-10 w-full items-center gap-2 rounded-md px-3 text-left transition ${
                isActive
                  ? styles.active
                  : 'bg-transparent text-slate-700 hover:bg-slate-50'
              }`}
              key={status}
              onClick={() => onSetStatus(status)}
              type="button"
            >
              <Icon
                className={isActive ? styles.iconClassName : 'text-slate-400 group-hover:text-slate-500'}
                name={styles.icon}
                size={18}
              />
              <span className="min-w-0 truncate text-sm font-semibold">
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>
    </EditorCard>
  )
}

function ProgressSummaryPanel({ draft, onAddProject, onRemoveProject, onUpdateProjects }) {
  return (
    <EditorCard
      action={<Button onClick={onAddProject} size="icon-sm" type="button" variant="ghost"><Icon name="plus" size={14} /></Button>}
      iconName="fileText"
      title="Progress Summary"
    >
      <div className="grid gap-5">
        {draft.projects.map((project, index) => (
          <div className="grid gap-2" key={project.id || `project-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <Input
                className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-1 font-semibold shadow-none focus-visible:border-slate-200 focus-visible:bg-white focus-visible:ring-0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'name', event.target.value))}
                placeholder="Campaign Setup"
                value={project.name}
              />
              <Input
                className="h-8 w-16 px-2 text-right text-xs font-semibold text-indigo-600"
                max="100"
                min="0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'progress_percent', event.target.value))}
                type="number"
                value={project.progress_percent}
              />
              <Button
                className="text-slate-400 hover:text-rose-600"
                onClick={() => onRemoveProject(index)}
                size="icon-sm"
                title="Delete project"
                type="button"
                variant="ghost"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <Progress className="h-1.5" value={Number(project.progress_percent) || 0} />
            <Input
              className="h-8 border-transparent bg-transparent px-1 text-xs text-slate-500 shadow-none focus-visible:border-slate-200 focus-visible:bg-white focus-visible:ring-0"
              onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'description', event.target.value))}
              placeholder="Stage: Tracking and first launch completed"
              value={project.description}
            />
          </div>
        ))}
      </div>
    </EditorCard>
  )
}

function ClientLinksAssetsPanel({ draft, onUpdateDashboardLinks, onUpdateReports }) {
  const dashboardLink = draft.dashboardLinks[0] ?? createBlankDashboardLink()
  const report = draft.reports[0] ?? createBlankReport()
  const visibleReports = draft.reports.filter((item) => [
    REPORT_STATUSES.PUBLISHED,
    REPORT_STATUSES.ARCHIVED,
  ].includes(item.status))

  function updateDashboardField(fieldName, value) {
    const nextLinks = draft.dashboardLinks.length > 0 ? [...draft.dashboardLinks] : [dashboardLink]
    nextLinks[0] = {
      ...nextLinks[0],
      [fieldName]: value,
    }
    onUpdateDashboardLinks(nextLinks)
  }

  function updateReportField(fieldName, value) {
    const nextReports = draft.reports.length > 0 ? [...draft.reports] : [report]
    nextReports[0] = {
      ...nextReports[0],
      [fieldName]: value,
    }
    onUpdateReports(nextReports)
  }

  return (
    <EditorCard iconName="link" title="Client Links & Assets">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-slate-600 uppercase">Marketing Dashboard</p>
            <Badge className={dashboardLink.status === DASHBOARD_LINK_STATUSES.ACTIVE ? toneClasses.green : toneClasses.neutral} variant="outline">
              {dashboardLink.status}
            </Badge>
          </div>
          <Input
            onChange={(event) => updateDashboardField('public_url', event.target.value)}
            placeholder="https://lookerstudio.google.com/reporting/..."
            value={dashboardLink.public_url}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              onValueChange={(value) => updateDashboardField('status', value)}
              value={dashboardLink.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dashboard status" />
              </SelectTrigger>
              <SelectContent>
              {Object.values(DASHBOARD_LINK_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => updateDashboardField('provider', value)}
              value={dashboardLink.provider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dashboard provider" />
              </SelectTrigger>
              <SelectContent>
              {Object.values(DASHBOARD_PROVIDERS).map((provider) => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <Checkbox
              checked={dashboardLink.show_on_overview}
              onCheckedChange={(checked) => updateDashboardField('show_on_overview', Boolean(checked))}
            />
            Show on Client Overview
          </label>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">Latest Published Report</p>
          <Select
            onValueChange={(value) => {
              const selectedReport = draft.reports.find((item) => item.id === value)
              if (selectedReport) {
                onUpdateReports([selectedReport, ...draft.reports.filter((item) => item.id !== selectedReport.id)])
              }
            }}
            value={report.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
            {visibleReports.length > 0 ? visibleReports.map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.title} ({item.status})</SelectItem>
            )) : (
              <SelectItem value={report.id}>{report.title || 'No published report yet'}</SelectItem>
            )}
            </SelectContent>
          </Select>
          <Textarea
            className="mt-3 min-h-20"
            onChange={(event) => updateReportField('summary', event.target.value)}
            placeholder="Summary preview"
            value={report.summary}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) => updateReportField('title', event.target.value)}
              placeholder="May 2026 Summary"
              value={report.title}
            />
            <Select
              onValueChange={(value) => updateReportField('status', value)}
              value={report.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Report status" />
              </SelectTrigger>
              <SelectContent>
              {Object.values(REPORT_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-2 text-xs text-slate-400">Only published or archived reports can be selected.</p>
        </div>
      </div>
    </EditorCard>
  )
}

export function AdminClientOverviewEditor({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const toast = useToast()
  const [pageState, setPageState] = useState(() => createInitialPageState(clientId, runtime))
  const { draft, editor, error } = pageState
  const [isDirty, setIsDirty] = useState(false)
  const [isPublishConfirmationOpen, setIsPublishConfirmationOpen] = useState(false)
  const [saveState, setSaveState] = useState('')

  function updateDraft(updater) {
    setPageState((currentPageState) => ({
      ...currentPageState,
      draft: typeof updater === 'function' ? updater(currentPageState.draft) : updater,
    }))
    setIsDirty(true)
    setSaveState('')
  }

  function saveDraft() {
    try {
      const nextEditor = saveAdminClientOverview({
        clientId,
        idGenerator: createUuid,
        input: draft,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })

      setPageState({
        draft: createDraft(nextEditor),
        editor: nextEditor,
        error: '',
      })
      setIsDirty(false)
      setSaveState('Saved successfully')
      toast.success('Draft saved', `${nextEditor.client.name}'s overview draft was updated.`)
    } catch (caughtError) {
      setPageState((currentPageState) => ({
        ...currentPageState,
        error: caughtError.message,
      }))
      setSaveState('')
      toast.error('Draft was not saved', caughtError.message)
    }
  }

  function publishDraft() {
    try {
      const savedEditor = saveAdminClientOverview({
        clientId,
        idGenerator: createUuid,
        input: draft,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })
      const publishedEditor = publishAdminClientOverview({
        clientId: savedEditor.client.id,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })

      setPageState({
        draft: createDraft(publishedEditor),
        editor: publishedEditor,
        error: '',
      })
      setIsDirty(false)
      setSaveState('Published successfully')
      setIsPublishConfirmationOpen(false)
      toast.success('Overview published', `${publishedEditor.client.name}'s client portal is up to date.`)
    } catch (caughtError) {
      setPageState((currentPageState) => ({
        ...currentPageState,
        error: caughtError.message,
      }))
      setIsPublishConfirmationOpen(false)
      setSaveState('')
      toast.error('Overview was not published', caughtError.message)
    }
  }

  if (error) {
    return <AdminErrorState message={error} />
  }

  if (!editor || !draft) {
    return (
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    )
  }

  return (
    <>
      <EditorPageHeader
        draft={draft}
        editor={editor}
        isDirty={isDirty}
        onPublish={() => setIsPublishConfirmationOpen(true)}
        onSave={saveDraft}
        saveState={saveState}
      />

      <ConfirmationDialog
        confirmLabel="Publish overview"
        description={`This will save the current draft and publish ${editor.client.name}'s overview to the client portal.`}
        onConfirm={publishDraft}
        onOpenChange={setIsPublishConfirmationOpen}
        open={isPublishConfirmationOpen}
        title="Publish client overview?"
        tone="primary"
      />

      <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,760px)_380px] lg:px-8">
        <div className="grid content-start gap-5">
          <LatestUpdateEditor
            draft={draft}
            onUpdateUpdates={(updates) => updateDraft((currentDraft) => ({ ...currentDraft, updates }))}
          />
          <CurrentFocusEditor
            draft={draft}
            onChange={(currentFocus) => updateDraft((currentDraft) => ({
              ...currentDraft,
              currentFocus,
            }))}
          />
          <TasksManager
            draft={draft}
            onAddTask={() => updateDraft((currentDraft) => ({
              ...currentDraft,
              tasks: [...currentDraft.tasks, createBlankTask(currentDraft.projects[0]?.id)],
            }))}
            onRemoveTask={(index) => updateDraft((currentDraft) => ({
              ...currentDraft,
              tasks: removeListItem(
                currentDraft.tasks,
                index,
                () => createBlankTask(currentDraft.projects[0]?.id),
              ),
            }))}
            onUpdateTasks={(tasks) => updateDraft((currentDraft) => ({ ...currentDraft, tasks }))}
          />
          <NeededFromClientEditor
            draft={draft}
            onAddAction={() => updateDraft((currentDraft) => ({
              ...currentDraft,
              neededActions: [...currentDraft.neededActions, createBlankNeededAction()],
            }))}
            onRemoveAction={(index) => updateDraft((currentDraft) => ({
              ...currentDraft,
              neededActions: removeListItem(currentDraft.neededActions, index, createBlankNeededAction),
            }))}
            onUpdateNeededActions={(neededActions) => updateDraft((currentDraft) => ({ ...currentDraft, neededActions }))}
          />
        </div>

        <aside className="grid content-start gap-5">
          <ProjectStatusPanel
            draft={draft}
            onSetStatus={(status) => updateDraft((currentDraft) => ({
              ...currentDraft,
              client: {
                ...currentDraft.client,
                status,
              },
            }))}
          />
          <ProgressSummaryPanel
            draft={draft}
            onAddProject={() => updateDraft((currentDraft) => ({
              ...currentDraft,
              projects: [...currentDraft.projects, createBlankProject()],
            }))}
            onRemoveProject={(index) => updateDraft((currentDraft) => ({
              ...currentDraft,
              projects: removeListItem(currentDraft.projects, index, createBlankProject),
            }))}
            onUpdateProjects={(projects) => updateDraft((currentDraft) => ({ ...currentDraft, projects }))}
          />
          <ClientLinksAssetsPanel
            draft={draft}
            onUpdateDashboardLinks={(dashboardLinks) => updateDraft((currentDraft) => ({
              ...currentDraft,
              dashboardLinks,
            }))}
            onUpdateReports={(reports) => updateDraft((currentDraft) => ({ ...currentDraft, reports }))}
          />
        </aside>
      </div>
    </>
  )
}
