import { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  CardContent,
  CardTitle,
  Checkbox,
  ConfirmationDialog,
  ContentToolbar,
  FoundationPageHeader,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui'

import {
  ACTIVITY_EVENT_TYPES,
  listClientActivityEvents,
} from '../../../domain/services/activityTrackingService'
import {
  discardAdminClientOverviewDraft,
  getAdminClientOverviewEditor,
  publishAdminClientOverview,
  restoreAdminClientOverviewFromPublished,
  saveAdminClientOverview,
} from '../../../domain/services/adminOverviewService'
import {
  cancelClientInvitation,
  createClientInvitation,
  listClientInvitations,
} from '../../../domain/services/clientInviteService'
import {
  addClientMember,
  listClientMembers,
  removeClientMembership,
  updateClientMembershipRole,
} from '../../../domain/services/clientMembershipService'
import { CLIENT_STATUSES, CLIENT_STATUS_META } from '../../../entities/client'
import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES, NEEDED_ACTION_STATUS_META } from '../../../entities/needed-from-client'
import { REPORT_STATUSES, REPORT_STATUS_META } from '../../../entities/report'
import { TASK_STATUSES, TASK_STATUS_META } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'
import {
  createBlankDashboardLink,
  createBlankNeededAction,
  createBlankProject,
  createBlankReport,
  createBlankTask,
  createBlankUpdate,
  createDraft,
  moveListItem,
  removeListItem,
  updateListItem,
} from '../model'

const statusOptions = [
  CLIENT_STATUSES.SETUP,
  CLIENT_STATUSES.ON_TRACK,
  CLIENT_STATUSES.NEEDS_ATTENTION,
  CLIENT_STATUSES.WAITING_CLIENT,
  CLIENT_STATUSES.BLOCKED,
  CLIENT_STATUSES.PAUSED,
]

const statusDescriptions = {
  [CLIENT_STATUSES.SETUP]: 'Workspace is being configured.',
  [CLIENT_STATUSES.ON_TRACK]: 'Work is progressing normally.',
  [CLIENT_STATUSES.NEEDS_ATTENTION]: 'Something needs review.',
  [CLIENT_STATUSES.WAITING_CLIENT]: 'Waiting for client action/approval.',
  [CLIENT_STATUSES.BLOCKED]: 'Work cannot move forward.',
  [CLIENT_STATUSES.PAUSED]: 'Work is intentionally paused.',
}

const statusOptionStyles = {
  [CLIENT_STATUSES.SETUP]: {
    active: 'bg-control-selected text-text-primary',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.SETUP].icon,
    iconClassName: 'text-text-secondary',
  },
  [CLIENT_STATUSES.ON_TRACK]: {
    active: 'bg-success-muted/80 text-success-foreground',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.ON_TRACK].icon,
    iconClassName: 'text-success-foreground',
  },
  [CLIENT_STATUSES.NEEDS_ATTENTION]: {
    active: 'bg-warning-muted/80 text-warning-foreground',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.NEEDS_ATTENTION].icon,
    iconClassName: 'text-warning-foreground',
  },
  [CLIENT_STATUSES.WAITING_CLIENT]: {
    active: 'bg-premium-purple/10 text-premium-purple',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.WAITING_CLIENT].icon,
    iconClassName: 'text-premium-purple',
  },
  [CLIENT_STATUSES.BLOCKED]: {
    active: 'bg-destructive/10 text-destructive',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.BLOCKED].icon,
    iconClassName: 'text-destructive',
  },
  [CLIENT_STATUSES.PAUSED]: {
    active: 'bg-control-selected text-text-primary',
    icon: CLIENT_STATUS_META[CLIENT_STATUSES.PAUSED].icon,
    iconClassName: 'text-text-secondary',
  },
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function StatusBadge({ status }) {
  const meta = CLIENT_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }

  return <SharedStatusBadge meta={meta} />
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="text-xs font-medium text-destructive" role="alert">
      {children}
    </p>
  )
}

function InlineEmptyState({ children, iconName = 'helpCircle', title }) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-dashed border-control-border bg-surface-subtle px-3 py-4 text-sm text-text-muted">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-block text-text-quaternary">
        <Icon name={iconName} size={15} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-text-secondary">{title}</p>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  )
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

function EditorPageHeader({
  draft,
  editor,
}) {
  return (
    <header className="border-b border-separator bg-surface">
      <PageShell className="gap-component px-4 py-6 sm:px-6 lg:px-8">
        <FoundationPageHeader
          actions={<StatusBadge status={draft.client.status} />}
          className="lg:items-center"
          eyebrow="Client overview editor"
          title={editor.client.name}
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
          <a className="inline-flex items-center gap-1 text-link no-underline hover:text-link-hover" href={`#client-overview?clientId=${editor.client.id}`}>
            agency.com/{editor.client.portalSlug}
            <Icon name="arrowUpRight" size={12} />
          </a>
          <span>{editor.client.primaryContactName}</span>
          <span>{editor.client.primaryContactEmail}</span>
        </div>
      </PageShell>
    </header>
  )
}

function EditorActionToolbar({
  editor,
  isDirty,
  onDiscardDraft,
  onPublish,
  onRestorePublished,
  onSave,
  saveState,
}) {
  const currentState = saveState || (isDirty ? 'Unsaved changes' : 'All changes saved')

  return (
    <ContentToolbar className="bg-block">
      <div className="flex flex-col gap-component xl:flex-row xl:items-center xl:justify-between">
        <dl className="grid gap-control text-xs sm:grid-cols-3">
          <div>
            <dt className="font-medium text-text-muted">Draft state</dt>
            <dd className={isDirty ? 'mt-1 font-semibold text-warning-foreground' : 'mt-1 font-semibold text-success-foreground'}>
              {currentState}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-text-muted">Draft saved</dt>
            <dd className="mt-1 font-semibold text-text-secondary">
              {editor.client.hasDraft ? formatDate(editor.client.overviewDraftSavedAt) : 'No draft'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-text-muted">Last published</dt>
            <dd className="mt-1 font-semibold text-text-secondary">
              {formatDate(editor.client.overviewPublishedAt)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-control lg:flex-row lg:items-center lg:justify-end">
          <div className="flex flex-wrap gap-control">
            <Button asChild size="sm" variant="outline">
              <a href={`#admin-client-preview?clientId=${editor.client.id}`}>
                <Icon name="user" size={15} />
                Preview Published
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={`#admin-client-preview?clientId=${editor.client.id}&preview=draft`}>
                <Icon name="fileText" size={15} />
                Preview Draft
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-control">
            <Button onClick={onSave} size="sm" type="button" variant="outline">
              Save Draft
            </Button>
            <Button onClick={onRestorePublished} size="sm" type="button" variant="outline">
              Restore Published
            </Button>
            {editor.client.hasDraft ? (
              <Button onClick={onDiscardDraft} size="sm" type="button" variant="destructive">
                Discard Draft
              </Button>
            ) : null}
            <Button onClick={onPublish} size="sm" type="button">
              <Icon name="zap" size={15} />
              Publish
            </Button>
          </div>
        </div>
      </div>
    </ContentToolbar>
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
            <a href="#admin-clients">Back to clients</a>
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
      <p className="mb-3 text-xs leading-5 text-text-muted">
        Write a short, human-readable update about what happened recently. This is the first thing the client reads.
      </p>
      <Input
        className="mb-3"
        onChange={(event) => updateField('title', event.target.value)}
        placeholder="Weekly client update"
        value={update.title}
      />
      <Textarea
        onChange={(event) => updateField('body', event.target.value)}
        placeholder="This week we launched..."
        value={update.body}
      />
      <p className="mt-2 text-xs text-text-quaternary">
        {charCount} characters. Client-visible updates require body text.
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
      <p className="mb-3 text-xs leading-5 text-text-muted">What are the 1-3 main directions the team is working on right now?</p>
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

function TasksManager({ draft, onAddTask, onMoveTask, onRemoveTask, onUpdateTasks }) {
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
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draft.tasks.map((task, index) => {
              const isClientVisible = task.visibility === VISIBILITY.CLIENT_VISIBLE

              return (
              <TableRow
                className={`align-top ${isClientVisible ? 'bg-block' : 'bg-block-subtle text-text-muted'}`}
                key={task.id || `task-${index}`}
              >
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
                    <Select
                      onValueChange={(value) => onUpdateTasks(updateListItem(draft.tasks, index, 'project_id', value === 'none' ? '' : value))}
                      value={task.project_id || 'none'}
                    >
                      <SelectTrigger className="h-7 w-[150px] text-xs">
                        <SelectValue placeholder="Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {draft.projects.filter((project) => project.id).map((project, projectIndex) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name || `Project ${projectIndex + 1}`}
                          </SelectItem>
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
                  <Input
                    className="mt-2 h-7 border-transparent bg-transparent px-0 text-xs text-text-muted shadow-none focus-visible:border-control-border focus-visible:bg-block focus-visible:px-2 focus-visible:ring-0"
                    onChange={(event) => onUpdateTasks(updateListItem(draft.tasks, index, 'description', event.target.value))}
                    placeholder="Internal detail or client-safe task context"
                    value={task.description}
                  />
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
                  <button
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      isClientVisible
                        ? 'bg-action-muted text-action hover:bg-action-muted'
                        : 'bg-control text-text-muted hover:bg-control-selected'
                    }`}
                    onClick={() => onUpdateTasks(updateListItem(
                      draft.tasks,
                      index,
                      'visibility',
                      isClientVisible ? VISIBILITY.INTERNAL : VISIBILITY.CLIENT_VISIBLE,
                    ))}
                    type="button"
                  >
                    <Icon name={isClientVisible ? 'user' : 'lock'} size={13} />
                    {isClientVisible ? 'Client' : 'Internal'}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      className="text-text-quaternary"
                      disabled={index === 0}
                      onClick={() => onMoveTask(index, -1)}
                      size="icon-sm"
                      title="Move task up"
                      type="button"
                      variant="ghost"
                    >
                      <Icon name="arrowRight" size={14} className="-rotate-90" />
                    </Button>
                    <Button
                      className="text-text-quaternary"
                      disabled={index === draft.tasks.length - 1}
                      onClick={() => onMoveTask(index, 1)}
                      size="icon-sm"
                      title="Move task down"
                      type="button"
                      variant="ghost"
                    >
                      <Icon name="arrowRight" size={14} className="rotate-90" />
                    </Button>
                    <Button
                      className="text-text-quaternary hover:text-destructive"
                      onClick={() => onRemoveTask(index)}
                      size="icon-sm"
                      title="Delete task"
                      type="button"
                      variant="ghost"
                    >
                      <Icon name="close" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="border-t border-action/20 bg-action-muted px-4 py-2 text-xs text-action">
          Client-visible tasks appear on the client overview. Internal tasks and their notes remain admin/team-only.
        </div>
      </div>
    </EditorCard>
  )
}

function NeededFromClientEditor({ draft, onAddAction, onRemoveAction, onUpdateNeededActions }) {
  function updateAction(index, fieldName, value) {
    onUpdateNeededActions(updateListItem(draft.neededActions, index, fieldName, value))
  }

  return (
    <EditorCard
      action={(
        <Button className="border-warning/20 bg-warning-muted text-warning-foreground hover:bg-warning-muted/80" onClick={onAddAction} size="sm" type="button" variant="outline">
          <Icon name="plus" size={14} />
          Add Request
        </Button>
      )}
      iconName="triangleAlert"
      title="Needed From Client"
    >
      <div className="grid gap-3">
        {draft.neededActions.map((action, index) => (
          <div className="grid gap-2 rounded-control border border-warning/20 bg-warning-muted/40 p-3" key={action.id || `needed-${index}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                onValueChange={(value) => updateAction(index, 'status', value)}
                value={action.status}
              >
                <SelectTrigger className="h-7 w-[145px] border-warning/20 bg-warning-muted text-xs font-semibold text-warning-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                {Object.values(NEEDED_ACTION_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {NEEDED_ACTION_STATUS_META[status]?.label ?? status}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <Input
                className="h-8 w-auto border-transparent bg-transparent px-1 text-xs text-text-muted shadow-none focus-visible:border-warning/20 focus-visible:bg-block focus-visible:ring-0"
                onChange={(event) => updateAction(index, 'due_date', event.target.value)}
                type="date"
                value={action.due_date}
              />
              <Button
                className="ml-auto text-text-quaternary hover:text-destructive"
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
              className="h-8 border-transparent bg-transparent px-1 font-medium shadow-none focus-visible:border-warning/20 focus-visible:bg-block focus-visible:ring-0"
              onChange={(event) => updateAction(index, 'title', event.target.value)}
              placeholder="Approve creative batch #2"
              value={action.title}
            />
            <Textarea
              className="min-h-16 border-warning/20 bg-surface/70 py-1 text-text-secondary focus-visible:border-warning/20"
              onChange={(event) => updateAction(index, 'description', event.target.value)}
              placeholder="Request details"
              value={action.description}
            />
            <Input
              className="h-8 border-warning/20 bg-surface/70 px-2 text-xs"
              onChange={(event) => updateAction(index, 'related_link', event.target.value)}
              placeholder="https://example.com/approval-link"
              value={action.related_link}
            />
            {action.client_response ? (
              <div className="rounded-control border border-action/20 bg-action-muted px-3 py-2 text-sm text-action">
                <p className="font-semibold">Client response</p>
                <p className="mt-1 leading-5">{action.client_response}</p>
                {action.responded_at ? (
                  <p className="mt-1 text-xs text-action">Responded {formatDate(action.responded_at)}</p>
                ) : null}
              </div>
            ) : null}
            {action.response_history?.length ? (
              <div className="rounded-control border border-separator bg-block px-3 py-2">
                <p className="text-xs font-bold tracking-wide text-text-muted uppercase">Response history</p>
                <div className="mt-2 grid gap-1 text-xs text-text-muted">
                  {action.response_history.map((event, eventIndex) => (
                    <p key={`${event.type}-${event.created_at}-${eventIndex}`}>
                      <span className="font-medium text-text-secondary">{event.type.replaceAll('_', ' ')}</span>
                      {event.created_at ? ` · ${formatDate(event.created_at)}` : ''}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {action.status === NEEDED_ACTION_STATUSES.ANSWERED ? (
                <Button
                  className="border-success/20 bg-success-muted text-success-foreground hover:bg-success-muted"
                  onClick={() => updateAction(index, 'status', NEEDED_ACTION_STATUSES.RESOLVED)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Mark resolved
                </Button>
              ) : null}
              {[NEEDED_ACTION_STATUSES.PENDING, NEEDED_ACTION_STATUSES.ANSWERED].includes(action.status) ? (
                <Button
                  className="border-control-border text-text-secondary hover:text-destructive"
                  onClick={() => updateAction(index, 'status', NEEDED_ACTION_STATUSES.CANCELLED)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Cancel request
                </Button>
              ) : null}
            </div>
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
              className={`group flex h-target w-full items-center gap-2 rounded-control px-control text-left transition-colors duration-motion-fast ease-motion-standard ${
                isActive
                  ? styles.active
                  : 'bg-transparent text-text-secondary hover:bg-surface-subtle'
              }`}
              key={status}
              onClick={() => onSetStatus(status)}
              type="button"
            >
              <Icon
                className={isActive ? styles.iconClassName : 'text-text-quaternary group-hover:text-text-muted'}
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
      <div className="grid gap-5">
        <div className="grid gap-2">
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

        <div className="border-t border-separator pt-5">
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
          <div className="mt-3 grid gap-2">
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
          <p className="mt-2 text-xs text-text-quaternary">Only published or archived reports can be selected.</p>
        </div>
      </div>
    </EditorCard>
  )
}

function AccessMembersPanel({ clientId, runtime }) {
  const toast = useToast()
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null)
  const [members, setMembers] = useState(() => listClientMembers({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
  })
  const [error, setError] = useState('')
  const trimmedMemberName = form.name.trim()
  const trimmedMemberEmail = form.email.trim()
  const memberNameIssue = form.name && trimmedMemberName.length < 2
    ? 'Enter at least 2 characters.'
    : ''
  const memberEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedMemberEmail)
    ? 'Enter a valid email address.'
    : ''

  function refreshMembers() {
    setMembers(listClientMembers({
      clientId,
      repositories: runtime.repositories,
      viewer: runtime.viewer,
    }))
  }

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function handleAddMember(event) {
    event.preventDefault()

    try {
      const member = addClientMember({
        clientId,
        email: form.email,
        idGenerator: createUuid,
        name: form.name,
        repositories: runtime.repositories,
        role: form.role,
        viewer: runtime.viewer,
      })

      setForm({
        email: '',
        name: '',
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      })
      refreshMembers()
      toast.success('Member added', `${member.name} can now access this client portal.`)
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Member was not added', caughtError.message)
    }
  }

  function handleRoleChange(member, role) {
    try {
      updateClientMembershipRole({
        membershipId: member.id,
        repositories: runtime.repositories,
        role,
        viewer: runtime.viewer,
      })
      refreshMembers()
      toast.success('Role updated', `${member.name}'s access role was updated.`)
    } catch (caughtError) {
      toast.error('Role was not updated', caughtError.message)
    }
  }

  function handleRemoveMember() {
    if (!memberPendingRemoval) {
      return
    }

    try {
      removeClientMembership({
        membershipId: memberPendingRemoval.id,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })
      const removedMemberName = memberPendingRemoval.name
      setMemberPendingRemoval(null)
      refreshMembers()
      toast.success('Member removed', `${removedMemberName} no longer has access to this client.`)
    } catch (caughtError) {
      toast.error('Member was not removed', caughtError.message)
    }
  }

  return (
    <EditorCard
      description="Manage who can open this client portal."
      iconName="users"
      title="Access & Members"
    >
      <div className="grid gap-4">
        {members.length > 0 ? (
          <div className="grid gap-2">
            {members.map((member) => (
              <article className="rounded-control border border-control-border bg-block-subtle p-3" key={member.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action-muted text-sm font-semibold text-action">
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{member.name}</p>
                    <p className="truncate text-xs text-text-muted">{member.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Select
                        onValueChange={(role) => handleRoleChange(member, role)}
                        value={member.role}
                      >
                        <SelectTrigger className="h-8 w-[130px] bg-block text-xs">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="text-text-quaternary hover:text-destructive"
                        onClick={() => setMemberPendingRemoval(member)}
                        size="icon-sm"
                        title="Remove member"
                        type="button"
                        variant="ghost"
                      >
                        <Icon name="close" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <InlineEmptyState iconName="users" title="No client users yet">
            Add a member or send an invitation before a client can open this portal.
          </InlineEmptyState>
        )}

        <form className="grid gap-3 border-t border-separator pt-4" noValidate onSubmit={handleAddMember}>
          <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Add client user</p>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Name</span>
            <Input
              aria-invalid={Boolean(memberNameIssue)}
              minLength={2}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Sarah Johnson"
              required
              value={form.name}
            />
            <FieldError>{memberNameIssue}</FieldError>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(memberEmailIssue)}
              inputMode="email"
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="sarah@client.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{memberEmailIssue}</FieldError>
          </label>
          <div className="flex gap-2">
            <Select onValueChange={(role) => updateForm('role', role)} value={form.role}>
              <SelectTrigger className="min-w-0 flex-1 bg-block">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={Boolean(memberNameIssue || memberEmailIssue)} type="submit">Add member</Button>
          </div>
          {error ? (
            <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </div>
      <ConfirmationDialog
        confirmLabel="Remove access"
        description={
          memberPendingRemoval
            ? `${memberPendingRemoval.name} will lose access to this client portal immediately.`
            : ''
        }
        onConfirm={handleRemoveMember}
        onOpenChange={(open) => {
          if (!open) {
            setMemberPendingRemoval(null)
          }
        }}
        open={Boolean(memberPendingRemoval)}
        title="Remove member access?"
        tone="destructive"
      />
    </EditorCard>
  )
}

function buildInviteLink(token) {
  if (typeof window === 'undefined') {
    return `#accept-invite?token=${token}`
  }

  return `${window.location.origin}${window.location.pathname}#accept-invite?token=${token}`
}

function formatInvitationDate(date) {
  if (!date) {
    return 'No expiration'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function InvitationsPanel({ clientId, runtime }) {
  const toast = useToast()
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [invitations, setInvitations] = useState(() => listClientInvitations({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))
  const [form, setForm] = useState({
    email: '',
    expiresAt: '',
    name: '',
    role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
  })
  const [error, setError] = useState('')
  const trimmedInvitationEmail = form.email.trim()
  const invitationEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedInvitationEmail)
    ? 'Enter a valid email address.'
    : ''

  function refreshInvitations() {
    setInvitations(listClientInvitations({
      clientId,
      repositories: runtime.repositories,
      viewer: runtime.viewer,
    }))
  }

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  async function copyInviteLink(invitation) {
    const inviteLink = buildInviteLink(invitation.token)

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied', invitation.email)
    } catch {
      toast.error('Invite link was not copied', inviteLink)
    }
  }

  function handleCreateInvitation(event) {
    event.preventDefault()

    try {
      const invitation = createClientInvitation({
        clientId,
        email: form.email,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.999Z` : null,
        idGenerator: createUuid,
        name: form.name,
        repositories: runtime.repositories,
        role: form.role,
        viewer: runtime.viewer,
      })

      setForm({
        email: '',
        expiresAt: '',
        name: '',
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      })
      refreshInvitations()
      toast.success('Invitation created', `${invitation.email} can accept the portal invite.`)
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Invitation was not created', caughtError.message)
    }
  }

  function handleCancelInvitation() {
    if (!invitationPendingCancel) {
      return
    }

    try {
      cancelClientInvitation({
        invitationId: invitationPendingCancel.id,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })
      const cancelledEmail = invitationPendingCancel.email
      setInvitationPendingCancel(null)
      refreshInvitations()
      toast.success('Invitation cancelled', cancelledEmail)
    } catch (caughtError) {
      toast.error('Invitation was not cancelled', caughtError.message)
    }
  }

  function handleResendPlaceholder(invitation) {
    toast.info('Email delivery is not connected yet', `Copy the invite link for ${invitation.email}.`)
  }

  return (
    <EditorCard
      description="Create and track local client portal invitations."
      iconName="mail"
      title="Invitations"
    >
      <div className="grid gap-4">
        {invitations.length > 0 ? (
          <div className="grid gap-2">
            {invitations.map((invitation) => {
              const inviteLink = buildInviteLink(invitation.token)
              const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING

              return (
                <article className="rounded-control border border-control-border bg-block-subtle p-3" key={invitation.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{invitation.email}</p>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {invitation.name || 'Unnamed invite'} · {invitation.role} · expires {formatInvitationDate(invitation.expires_at)}
                      </p>
                    </div>
                    <SharedStatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
                  </div>

                  <p className="mt-3 truncate rounded-item border border-control-border bg-block px-2 py-1.5 font-mono text-[11px] text-text-muted">
                    {inviteLink}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => copyInviteLink(invitation)} size="sm" type="button" variant="outline">
                      Copy link
                    </Button>
                    <Button asChild size="sm" type="button" variant="outline">
                      <a href={`#accept-invite?token=${invitation.token}`}>
                        Open
                        <Icon name="arrowUpRight" size={13} />
                      </a>
                    </Button>
                    {isPending ? (
                      <>
                        <Button onClick={() => handleResendPlaceholder(invitation)} size="sm" type="button" variant="ghost">
                          Resend
                        </Button>
                        <Button
                          className="text-destructive hover:text-destructive"
                          onClick={() => setInvitationPendingCancel(invitation)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Revoke invite
                        </Button>
                      </>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <InlineEmptyState iconName="mail" title="No invitations yet">
            Create an invitation to generate a local acceptance link. Email delivery remains simulated.
          </InlineEmptyState>
        )}

        <form className="grid gap-3 border-t border-separator pt-4" noValidate onSubmit={handleCreateInvitation}>
          <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Create invitation</p>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Name</span>
            <Input
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Sarah Johnson"
              value={form.name}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(invitationEmailIssue)}
              inputMode="email"
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="sarah@client.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{invitationEmailIssue}</FieldError>
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
            <Select onValueChange={(role) => updateForm('role', role)} value={form.role}>
              <SelectTrigger className="bg-block">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              onChange={(event) => updateForm('expiresAt', event.target.value)}
              type="date"
              value={form.expiresAt}
            />
          </div>
          <Button disabled={Boolean(invitationEmailIssue)} type="submit">Create invitation</Button>
          {error ? (
            <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </div>
      <ConfirmationDialog
        confirmLabel="Revoke invitation"
        description={
          invitationPendingCancel
            ? `${invitationPendingCancel.email} will no longer be able to accept this invite link.`
            : ''
        }
        onConfirm={handleCancelInvitation}
        onOpenChange={(open) => {
          if (!open) {
            setInvitationPendingCancel(null)
          }
        }}
        open={Boolean(invitationPendingCancel)}
        title="Revoke invitation?"
        tone="destructive"
      />
    </EditorCard>
  )
}

const activityEventMeta = {
  [ACTIVITY_EVENT_TYPES.DASHBOARD_OPENED]: {
    icon: 'layoutDashboard',
    label: 'Opened dashboard',
  },
  [ACTIVITY_EVENT_TYPES.NEEDED_ACTION_ANSWERED]: {
    icon: 'checkCircle2',
    label: 'Answered client request',
  },
  [ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED]: {
    icon: 'user',
    label: 'Opened overview',
  },
  [ACTIVITY_EVENT_TYPES.REPORT_OPENED]: {
    icon: 'fileText',
    label: 'Opened report',
  },
}

function formatActivityTime(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

function getActivityDetail(event) {
  if (event.metadata?.reportId) {
    return `Report: ${event.metadata.reportId}`
  }

  if (event.metadata?.dashboardId) {
    return `Dashboard: ${event.metadata.dashboardId}`
  }

  if (event.metadata?.actionId) {
    return `Request: ${event.metadata.actionId}`
  }

  return event.actorEmail || event.actorRole || 'Client portal'
}

function RecentClientActivityPanel({ clientId, runtime }) {
  const [events, setEvents] = useState(() => listClientActivityEvents({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))

  function refreshActivity() {
    setEvents(listClientActivityEvents({
      clientId,
      repositories: runtime.repositories,
      viewer: runtime.viewer,
    }))
  }

  return (
    <EditorCard
      action={(
        <Button onClick={refreshActivity} size="sm" type="button" variant="ghost">
          Refresh
        </Button>
      )}
      description="Local QA activity from client-facing pages."
      iconName="clock"
      title="Recent Client Activity"
    >
      {events.length > 0 ? (
        <div className="grid gap-2">
          {events.map((event) => {
            const meta = activityEventMeta[event.eventType] ?? {
              icon: 'clock',
              label: event.eventType,
            }

            return (
              <article className="rounded-control border border-control-border bg-block-subtle p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-action-muted text-action">
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">{meta.label}</p>
                      <span className="shrink-0 text-xs text-text-muted">{formatActivityTime(event.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {event.actorName} · {getActivityDetail(event)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-control border border-dashed border-control-border bg-surface-subtle px-3 py-4 text-sm text-text-muted">
          No client activity has been recorded yet.
        </div>
      )}
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

      if (pendingDeletion.type === 'task') {
        return {
          ...currentDraft,
          tasks: removeListItem(
            currentDraft.tasks,
            pendingDeletion.index,
            () => createBlankTask(currentDraft.projects[0]?.id),
          ),
        }
      }

      if (pendingDeletion.type === 'needed_action') {
        return {
          ...currentDraft,
          neededActions: removeListItem(
            currentDraft.neededActions,
            pendingDeletion.index,
            createBlankNeededAction,
          ),
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

  function saveDraft() {
    setSaveState('Saving draft...')
    runtime.dataClient.write((repositories) => saveAdminClientOverview({
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
        setSaveState('Saved successfully')
        toast.success('Draft saved', `${nextEditor.client.name}'s overview draft was updated.`)
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
      <PageShell className="px-4 py-8 sm:px-6 lg:px-8">
        <AdminErrorState message={error} />
      </PageShell>
    )
  }

  if (pageState.status === 'loading' || !editor || !draft) {
    return (
      <PageShell className="px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-block shadow-none">
          <CardContent className="min-h-[260px] animate-pulse" />
        </Card>
      </PageShell>
    )
  }

  return (
    <>
      <EditorPageHeader
        draft={draft}
        editor={editor}
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

      <PageShell className="px-4 py-6 sm:px-6 lg:px-8">
        <EditorActionToolbar
          editor={editor}
          isDirty={isDirty}
          onDiscardDraft={discardDraft}
          onPublish={() => setIsPublishConfirmationOpen(true)}
          onRestorePublished={restorePublished}
          onSave={saveDraft}
          saveState={saveState}
        />

        <div className="grid w-full gap-card lg:grid-cols-inspector">
          <div className="grid content-start gap-card">
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
            <TasksManager
              draft={draft}
              onAddTask={() => updateDraft((currentDraft) => ({
                ...currentDraft,
                tasks: [
                  ...currentDraft.tasks,
                  {
                    ...createBlankTask(currentDraft.projects[0]?.id),
                    sort_order: (currentDraft.tasks.length + 1) * 10,
                  },
                ],
              }))}
              onMoveTask={(index, direction) => updateDraft((currentDraft) => ({
                ...currentDraft,
                tasks: moveListItem(currentDraft.tasks, index, direction),
              }))}
              onRemoveTask={(index) => requestDeletion(
                'task',
                index,
                draft.tasks[index]?.title || `Task ${index + 1}`,
              )}
              onUpdateTasks={(tasks) => updateDraft((currentDraft) => ({ ...currentDraft, tasks }))}
            />
            <NeededFromClientEditor
              draft={draft}
              onAddAction={() => updateDraft((currentDraft) => ({
                ...currentDraft,
                neededActions: [...currentDraft.neededActions, createBlankNeededAction()],
              }))}
              onRemoveAction={(index) => requestDeletion(
                'needed_action',
                index,
                draft.neededActions[index]?.title || `Client request ${index + 1}`,
              )}
              onUpdateNeededActions={(neededActions) => updateDraft((currentDraft) => ({ ...currentDraft, neededActions }))}
            />
          </div>

          <aside className="grid content-start gap-card">
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
            <AccessMembersPanel clientId={clientId} runtime={runtime} />
            <InvitationsPanel clientId={clientId} runtime={runtime} />
            <RecentClientActivityPanel clientId={clientId} runtime={runtime} />
          </aside>
        </div>
      </PageShell>
    </>
  )
}
