import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Badge,
  Button,
  CardContent,
  CardTitle,
  Checkbox,
  ConfirmationDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  PageShell,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
  Progress,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge as SharedStatusBadge,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui'

import {
  discardAdminClientOverviewDraft,
  getAdminClientOverviewEditor,
  publishAdminClientOverview,
  restoreAdminClientOverviewFromPublished,
  saveAdminClientOverview,
} from '../../../domain/services/adminOverviewService'
import { AdminClientWorkspaceHeader } from '../../admin-client-workspace'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { TASK_STATUSES } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import {
  createBlankDashboardLink,
  createBlankProject,
  createBlankReport,
  createBlankUpdate,
  createDraft,
  moveListItem,
  removeListItem,
  updateListItem,
} from '../model'

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
  void clientId
  void runtime

  return {
    draft: null,
    editor: null,
    error: '',
    status: 'loading',
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

function formatRelativeTime(date) {
  if (!date) {
    return 'not published'
  }

  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000))

  if (seconds < 5) {
    return 'just now'
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.round(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  return formatDate(date)
}

function EditorCard({ action, children, description, iconName, title }) {
  return (
    <Card className="gap-0 bg-block py-0 shadow-none">
      <CardHeader className="border-b border-separator px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              {iconName ? <Icon className="text-text-quaternary" name={iconName} size={15} /> : null}
              {title}
            </CardTitle>
            {description ? <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p> : null}
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

function SaveStatusIndicator({ editor, isDirty, saveState }) {
  const isSaving = saveState.startsWith('Saving') || saveState.startsWith('Publishing')
  const hasPublished = Boolean(editor.client.overviewPublishedAt)
  const savedAt = editor.client.overviewDraftSavedAt || editor.client.overviewPublishedAt || editor.client.updatedAt

  let icon
  let label
  let tone = 'text-text-muted'

  if (isSaving) {
    icon = (
      <span
        aria-hidden="true"
        className="inline-block size-3 shrink-0 animate-spin rounded-full border-2 border-text-quaternary border-t-transparent"
      />
    )
    label = saveState
  } else if (isDirty) {
    icon = <Icon aria-hidden="true" className="text-warning" name="circle" size={10} />
    label = 'Unsaved changes'
    tone = 'text-text-secondary'
  } else if (saveState) {
    icon = <Icon aria-hidden="true" className="text-success" name="checkCircle2" size={13} />
    label = saveState
    tone = 'text-text-secondary'
  } else {
    icon = <Icon aria-hidden="true" className="text-success" name="checkCircle2" size={13} />
    label = `Saved - ${formatRelativeTime(savedAt)}`
    tone = 'text-text-secondary'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex min-w-0 cursor-default items-center gap-tag text-label ${tone}`}>
          {icon}
          <span className="min-w-0 truncate">{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="grid gap-1">
        <span>Draft saved: {formatDate(editor.client.overviewDraftSavedAt)}</span>
        <span>Last published: {hasPublished ? formatDate(editor.client.overviewPublishedAt) : 'Not published yet'}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function EditorActionToolbar({
  editor,
  isDirty,
  onDiscardDraft,
  onPublish,
  onRestorePublished,
  saveState,
}) {
  const previewPublishedHref = `/admin/client-preview?clientId=${editor.client.id}&preview=published`
  const previewDraftHref = `/admin/client-preview?clientId=${editor.client.id}&preview=draft`
  const hasDraft = editor.client.hasDraft
  const hasPublished = Boolean(editor.client.overviewPublishedAt)
  const hasMultiplePreviewSources = hasPublished && hasDraft
  const singlePreviewHref = hasDraft ? previewDraftHref : previewPublishedHref
  const singlePreviewLabel = hasDraft ? 'Preview saved draft' : 'View client version'
  const isSinglePreviewDisabled = !hasDraft && !hasPublished

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-control lg:justify-end">
      <SaveStatusIndicator editor={editor} isDirty={isDirty} saveState={saveState} />

      <div className="flex min-w-0 flex-wrap items-center gap-tag">
        {hasMultiplePreviewSources ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" type="button" variant="ghost">
                <Icon name="user" size={14} />
                Preview
                <Icon className="text-text-quaternary" name="chevronDown" size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
              <DropdownMenuItem asChild>
                <Link to={previewPublishedHref}>
                  <Icon name="user" size={15} />
                  <span className="grid gap-0.5">
                    <span>View client version</span>
                    <span className="text-xs font-normal text-text-muted">The currently published page clients can see.</span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={previewDraftHref}>
                  <Icon name="fileText" size={15} />
                  <span className="grid gap-0.5">
                    <span>Preview saved draft</span>
                    <span className="text-xs font-normal text-text-muted">Unpublished changes for admin review.</span>
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          isSinglePreviewDisabled ? (
            <Button disabled size="sm" type="button" variant="ghost">
                <Icon name="user" size={14} />
                Preview unavailable
            </Button>
          ) : (
            <Button asChild size="sm" type="button" variant="ghost">
              <Link to={singlePreviewHref}>
                <Icon name={hasDraft ? 'fileText' : 'user'} size={14} />
                {singlePreviewLabel}
              </Link>
            </Button>
          )
        )}

        <Button onClick={onPublish} size="sm" type="button">
          <Icon name="zap" size={14} />
          Publish
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More actions" size="icon-sm" type="button" variant="ghost">
              <Icon name="ellipsis" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-max min-w-56 max-w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              className="whitespace-nowrap"
              disabled={!hasPublished}
              onClick={onRestorePublished}
            >
              <Icon name="arrowRight" className="-rotate-180" size={15} />
              <span>Restore from published</span>
            </DropdownMenuItem>
            {hasDraft ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDiscardDraft} variant="destructive">
                  <Icon name="close" size={15} />
                  <span>Discard draft</span>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function AdminErrorState({ message }) {
  return (
    <Card className="bg-block shadow-none">
      <CardContent className="flex min-h-[280px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icon name="shieldCheck" size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-text-primary">Client overview unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">{message}</p>
          <Button asChild className="mt-5" variant="outline">
            <Link to="/admin/clients">Back to clients</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LatestUpdateEditor({ draft, onDeleteUpdate, onUpdateUpdates }) {
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
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => updateField('visibility', value)}
            value={update.visibility}
          >
            <SelectTrigger className="h-8 w-[135px] bg-block text-xs">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client visible</SelectItem>
              <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="text-text-quaternary hover:text-destructive"
            onClick={onDeleteUpdate}
            size="icon-sm"
            title="Delete latest update"
            type="button"
            variant="ghost"
          >
            <Icon name="close" size={14} />
          </Button>
        </div>
      )}
      iconName="messageSquare"
      title="Latest Update"
    >
      <Input
        className="mb-3"
        onChange={(event) => updateField('title', event.target.value)}
        placeholder="Weekly client update"
        value={update.title}
      />
      <Textarea
        onChange={(event) => updateField('body', event.target.value)}
        placeholder="This week we launched the first campaign structure, connected tracking, and started testing new ad angles."
        value={update.body}
      />
      <p className="mt-2 text-xs text-text-quaternary">
        {charCount} characters
      </p>
      {update.visibility === VISIBILITY.INTERNAL ? (
        <p className="mt-2 rounded-control bg-warning-muted px-3 py-2 text-xs text-warning-foreground">
          Internal update: this text is saved for the agency only and will not appear on the client portal.
        </p>
      ) : null}
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
      action={<Badge className="bg-control text-text-secondary" variant="outline">{activeItems.length}/3 items</Badge>}
      iconName="target"
      title="Current Focus"
    >
      <div className="grid gap-2">
        {draft.currentFocus.map((focusItem, index) => (
          <div className="group flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2" key={index}>
            <Icon className="text-text-quaternary" name="grid" size={14} />
            <Input
              className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-0 shadow-none focus-visible:ring-0"
              onChange={(event) => onChange(draft.currentFocus.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              placeholder="e.g. Meta Ads campaign optimization"
              value={focusItem}
            />
            <button
              aria-label={`Remove focus item: ${focusItem || 'Untitled focus item'}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center text-text-quaternary opacity-70 transition hover:text-destructive hover:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive/20 focus-visible:outline-none"
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

function ConnectedWorkflowSummary({ editor }) {
  const tasks = editor.tasks ?? []
  const neededActions = editor.neededActions ?? []
  const clientId = editor.client.id
  const clientVisibleTasks = tasks.filter((task) => (
    task.visibility === VISIBILITY.CLIENT_VISIBLE
    && task.status !== TASK_STATUSES.DONE
  ))
  const internalTasks = tasks.filter((task) => task.visibility === VISIBILITY.INTERNAL)
  const openRequests = neededActions.filter((action) => [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status))
  const answeredRequests = neededActions.filter((action) => action.status === NEEDED_ACTION_STATUSES.ANSWERED)
  const taskHref = `/admin/tasks?clientId=${clientId}`

  const rows = [
    {
      action: 'Manage tasks',
      href: taskHref,
      iconName: 'checkCircle2',
      meta: `${clientVisibleTasks.length} client-visible - ${internalTasks.length} internal`,
      title: 'Tasks',
    },
    {
      action: 'Manage requests',
      href: `/admin/client-requests?clientId=${clientId}`,
      iconName: 'messageSquare',
      meta: `${openRequests.length} open - ${answeredRequests.length} answered`,
      title: 'Client requests',
    },
  ]

  return (
    <EditorCard iconName="link" title="Connected Workflow">
      <div className="grid gap-1">
        {rows.map((row) => (
          <div className="group flex items-center gap-3 rounded-control px-2 py-2 transition-colors hover:bg-control" key={row.title}>
            <Icon className="text-text-quaternary" name={row.iconName} size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{row.title}</p>
              <p className="text-xs text-text-muted">{row.meta}</p>
            </div>
            <Button asChild size="sm" type="button" variant="ghost">
              <Link to={row.href}>
                {row.action}
                <Icon className="text-text-quaternary" name="arrowUpRight" size={13} />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </EditorCard>
  )
}
function ProgressSummaryPanel({ draft, onAddProject, onMoveProject, onRemoveProject, onUpdateProjects }) {
  return (
    <EditorCard
      action={<Button onClick={onAddProject} size="icon-sm" type="button" variant="ghost"><Icon name="plus" size={14} /></Button>}
      iconName="fileText"
      title="Progress Summary"
    >
      <div className="grid gap-5">
        {draft.projects.map((project, index) => (
          <div className="grid gap-2 rounded-control border border-separator bg-block-subtle p-3" key={project.id || `project-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <Input
                className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-1 font-semibold shadow-none focus-visible:border-control-border focus-visible:bg-block focus-visible:ring-0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'name', event.target.value))}
                placeholder="Campaign Setup"
                value={project.name}
              />
              <Input
                className="h-8 w-16 px-2 text-right text-xs font-semibold text-action"
                max="100"
                min="0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'progress_percent', event.target.value))}
                type="number"
                value={project.progress_percent}
              />
              <Button
                className="text-text-quaternary"
                disabled={index === 0}
                onClick={() => onMoveProject(index, -1)}
                size="icon-sm"
                title="Move project up"
                type="button"
                variant="ghost"
              >
                <Icon name="arrowRight" size={14} className="-rotate-90" />
              </Button>
              <Button
                className="text-text-quaternary"
                disabled={index === draft.projects.length - 1}
                onClick={() => onMoveProject(index, 1)}
                size="icon-sm"
                title="Move project down"
                type="button"
                variant="ghost"
              >
                <Icon name="arrowRight" size={14} className="rotate-90" />
              </Button>
              <Button
                className="text-text-quaternary hover:text-destructive"
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
              className="h-8 border-transparent bg-transparent px-1 text-xs text-text-muted shadow-none focus-visible:border-control-border focus-visible:bg-block focus-visible:ring-0"
              onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'description', event.target.value))}
              placeholder="Stage: Tracking and first launch completed"
              value={project.description}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                className="h-8 px-2 text-xs"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'status', event.target.value))}
                placeholder="in_progress"
                value={project.status}
              />
              <Input
                className="h-8 px-2 text-xs"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'start_date', event.target.value))}
                type="date"
                value={project.start_date}
              />
              <Input
                className="h-8 px-2 text-xs"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'end_date', event.target.value))}
                type="date"
                value={project.end_date}
              />
            </div>
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
      <div className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Marketing Dashboard</p>
            <SharedStatusBadge meta={DASHBOARD_LINK_STATUS_META[dashboardLink.status]} />
          </div>
          <Input
            onChange={(event) => updateDashboardField('public_url', event.target.value)}
            placeholder="Public URL: https://lookerstudio.google.com/reporting/..."
            value={dashboardLink.public_url}
          />
          <Input
            onChange={(event) => updateDashboardField('embed_url', event.target.value)}
            placeholder="Embed URL: https://lookerstudio.google.com/embed/..."
            value={dashboardLink.embed_url}
          />
          <Textarea
            className="min-h-16"
            onChange={(event) => updateDashboardField('fallback_message', event.target.value)}
            placeholder="Fallback message shown when dashboard is not ready or unavailable"
            value={dashboardLink.fallback_message}
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
                <SelectItem key={status} value={status}>
                  {DASHBOARD_LINK_STATUS_META[status]?.label ?? status}
                </SelectItem>
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
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <Checkbox
              checked={dashboardLink.show_on_overview}
              onCheckedChange={(checked) => updateDashboardField('show_on_overview', Boolean(checked))}
            />
            Show on Client Overview
          </label>
        </div>

        <div className="min-w-0 border-t border-separator pt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Latest Published Report</p>
            <Button
              onClick={() => onUpdateReports([createBlankReport(), ...draft.reports])}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Icon name="plus" size={14} />
              New report
            </Button>
          </div>
          <Select
            onValueChange={(value) => {
              const selectedReport = draft.reports.find((item) => item.id === value)
              if (selectedReport) {
                onUpdateReports([selectedReport, ...draft.reports.filter((item) => item.id !== selectedReport.id)])
              }
            }}
            value={report.id || '__current_report__'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
            {visibleReports.length > 0 ? visibleReports.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.title} ({REPORT_STATUS_META[item.status]?.label ?? item.status})
              </SelectItem>
            )) : (
              <SelectItem value="__current_report__">{report.title || 'No published report yet'}</SelectItem>
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
                <SelectItem key={status} value={status}>
                  {REPORT_STATUS_META[status]?.label ?? status}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) => updateReportField('period_start', event.target.value)}
              type="date"
              value={report.period_start}
            />
            <Input
              onChange={(event) => updateReportField('period_end', event.target.value)}
              type="date"
              value={report.period_end}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Input
              onChange={(event) => updateReportField('dashboard_url', event.target.value)}
              placeholder="Dashboard URL"
              value={report.dashboard_url}
            />
            <Input
              onChange={(event) => updateReportField('pdf_url', event.target.value)}
              placeholder="PDF/report URL"
              value={report.pdf_url}
            />
          </div>
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
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [saveState, setSaveState] = useState('')

  useEffect(() => {
    let isActive = true

    void Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setPageState({
          draft: null,
          editor: null,
          error: '',
          status: 'loading',
        })

        return runtime.dataClient.read((repositories) => loadEditor(clientId, {
          ...runtime,
          repositories,
        }))
      })
      .then((editorData) => {
        if (!isActive || !editorData) {
          return
        }

        setPageState({
          draft: createDraft(editorData),
          editor: editorData,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('')
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setPageState({
          draft: null,
          editor: null,
          error: caughtError.message,
          status: 'error',
        })
      })

    return () => {
      isActive = false
    }
  }, [clientId, runtime])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('agency-reports:editor-dirty-change', {
      detail: { isDirty },
    }))

    return () => {
      window.dispatchEvent(new CustomEvent('agency-reports:editor-dirty-change', {
        detail: { isDirty: false },
      }))
    }
  }, [isDirty])

  const autosaveTimeoutRef = useRef(null)
  const saveDraftRef = useRef(null)

  useEffect(() => {
    if (!isDirty || !draft || !editor) {
      return undefined
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      saveDraftRef.current?.({ silent: true })
    }, 1500)

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [draft, isDirty, editor])

  function updateDraft(updater) {
    setPageState((currentPageState) => ({
      ...currentPageState,
      draft: typeof updater === 'function' ? updater(currentPageState.draft) : updater,
    }))
    setIsDirty(true)
    setSaveState('')
  }

  function requestDeletion(type, index = null, label = '') {
    setPendingDeletion({ index, label, type })
  }

  function confirmDeletion() {
    if (!pendingDeletion) {
      return
    }

    updateDraft((currentDraft) => {
      if (pendingDeletion.type === 'latest_update') {
        return {
          ...currentDraft,
          updates: [],
        }
      }

      if (pendingDeletion.type === 'project') {
        return {
          ...currentDraft,
          projects: removeListItem(currentDraft.projects, pendingDeletion.index, createBlankProject),
        }
      }

      return currentDraft
    })
    setPendingDeletion(null)
  }

  function saveDraft({ silent = false } = {}) {
    setSaveState('Saving...')
    return runtime.dataClient.write((repositories) => saveAdminClientOverview({
      clientId,
      idGenerator: createUuid,
      input: draft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('')
        if (!silent) {
          toast.success('Draft saved', `${nextEditor.client.name}'s overview draft was updated.`)
        }
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Draft was not saved', caughtError.message)
      })
  }

  useEffect(() => {
    saveDraftRef.current = saveDraft
  })

  function publishDraft() {
    setSaveState('Publishing...')
    runtime.dataClient.write((repositories) => {
      const nextEditor = saveAdminClientOverview({
        clientId,
        idGenerator: createUuid,
        input: draft,
        repositories,
        viewer: runtime.viewer,
      })

      return publishAdminClientOverview({
        clientId: nextEditor.client.id,
        idGenerator: createUuid,
        repositories,
        viewer: runtime.viewer,
      })
    })
      .then((publishedEditor) => {
        setPageState({
          draft: createDraft(publishedEditor),
          editor: publishedEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Published successfully')
        setIsPublishConfirmationOpen(false)
        toast.success('Overview published', `${publishedEditor.client.name}'s client portal is up to date.`)
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setIsPublishConfirmationOpen(false)
        setSaveState('')
        toast.error('Overview was not published', caughtError.message)
      })
  }

  function discardDraft() {
    setSaveState('Discarding draft...')
    runtime.dataClient.write((repositories) => discardAdminClientOverviewDraft({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Draft discarded')
        toast.success('Draft discarded', 'The editor now matches the published client overview.')
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Draft was not discarded', caughtError.message)
      })
  }

  function restorePublished() {
    setSaveState('Restoring published...')
    runtime.dataClient.write((repositories) => restoreAdminClientOverviewFromPublished({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Restored from published')
        toast.success('Published overview restored', 'The draft has been reset to the current client-facing version.')
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Published overview was not restored', caughtError.message)
      })
  }

  if (pageState.status === 'error' && error && !editor) {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <AdminErrorState message={error} />
      </PageShell>
    )
  }

  if (pageState.status === 'loading' || !editor || !draft) {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <Card className="bg-block shadow-none">
          <CardContent className="min-h-[260px] animate-pulse" />
        </Card>
      </PageShell>
    )
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={{
          ...editor.client,
          status: draft.client.status,
        }}
        currentPage="overview"
        eyebrow="Client overview editor"
        actions={(
          <EditorActionToolbar
            editor={editor}
            isDirty={isDirty}
            onDiscardDraft={discardDraft}
            onPublish={() => setIsPublishConfirmationOpen(true)}
            onRestorePublished={restorePublished}
            saveState={saveState}
          />
        )}
        onStatusChange={(status) => updateDraft((currentDraft) => ({
          ...currentDraft,
          client: {
            ...currentDraft.client,
            status,
          },
        }))}
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

      <ConfirmationDialog
        confirmLabel="Delete"
        description={
          pendingDeletion
            ? `${pendingDeletion.label || 'This item'} will be removed from the current draft. Save or publish after deletion to persist the change.`
            : ''
        }
        onConfirm={confirmDeletion}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeletion(null)
          }
        }}
        open={Boolean(pendingDeletion)}
        title="Delete draft item?"
        tone="destructive"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <div className="grid gap-card">
          <div className="grid gap-card lg:grid-cols-2">
            <LatestUpdateEditor
              draft={draft}
              onDeleteUpdate={() => requestDeletion('latest_update', null, 'Latest update')}
              onUpdateUpdates={(updates) => updateDraft((currentDraft) => ({ ...currentDraft, updates }))}
            />
            <CurrentFocusEditor
              draft={draft}
              onChange={(currentFocus) => updateDraft((currentDraft) => ({
                ...currentDraft,
                currentFocus,
              }))}
            />
          </div>
          <div className="grid gap-card lg:grid-cols-2">
            <ProgressSummaryPanel
              draft={draft}
              onAddProject={() => updateDraft((currentDraft) => ({
                ...currentDraft,
                projects: [
                  ...currentDraft.projects,
                  {
                    ...createBlankProject(),
                    sort_order: (currentDraft.projects.length + 1) * 10,
                  },
                ],
              }))}
              onMoveProject={(index, direction) => updateDraft((currentDraft) => ({
                ...currentDraft,
                projects: moveListItem(currentDraft.projects, index, direction),
              }))}
              onRemoveProject={(index) => requestDeletion(
                'project',
                index,
                draft.projects[index]?.name || `Project ${index + 1}`,
              )}
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
          </div>
          <ConnectedWorkflowSummary editor={editor} />
        </div>
      </PageShell>
    </>
  )
}
