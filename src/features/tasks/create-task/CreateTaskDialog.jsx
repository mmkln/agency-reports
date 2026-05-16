import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'
import { USER_ROLES } from '@/entities/profile'
import { getTaskStatusMeta, TASK_STATUSES } from '@/entities/task'
import { TaskVisibilityBadge } from '@/entities/task/ui'
import { VISIBILITY } from '@/entities/update'

const createTaskTextareaClass = 'resize-none border-transparent bg-control px-component py-control text-body shadow-none hover:bg-control-hover focus-visible:border-ring focus-visible:bg-block focus-visible:ring-2 focus-visible:ring-ring/25'

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive">{children}</p>
}

export function CreateTaskDialog({
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
              <DialogTitle className="text-heading text-text-primary">New Task</DialogTitle>
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
                        <SelectItem key={status} value={status}>{getTaskStatusMeta(status).label}</SelectItem>
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
                    <div className="flex h-target items-center gap-2 rounded-control bg-control px-component text-ui text-text-secondary">
                      <Icon name="lock" size={15} />
                      <TaskVisibilityBadge visibility={VISIBILITY.INTERNAL} />
                    </div>
                  )}
                </label>
              </div>

              <label className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  className={`${createTaskTextareaClass} min-h-24`}
                  id="task-description"
                  onChange={(event) => onChange({ ...taskDraft, description: event.target.value })}
                  placeholder="Context for the person doing the work."
                  value={taskDraft.description}
                />
              </label>

              <label className="grid gap-2">
                <Label htmlFor="task-internal-note">Internal note</Label>
                <Textarea
                  className={`${createTaskTextareaClass} min-h-24`}
                  id="task-internal-note"
                  onChange={(event) => onChange({ ...taskDraft, internalNote: event.target.value })}
                  placeholder="Private agency context."
                  value={taskDraft.internalNote}
                />
              </label>

              {filters.visibility === VISIBILITY.CLIENT_VISIBLE && !canCreateClientVisibleTasks ? (
                <p className="rounded-control bg-control px-component py-control text-ui text-text-secondary">
                  Team-created tasks are saved as internal and can be made client-visible by an admin.
                </p>
              ) : null}
            </div>
          </OverlayBody>
          <OverlayFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-ui">
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
