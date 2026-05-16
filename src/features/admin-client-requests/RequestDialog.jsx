import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
} from '../../entities/needed-from-client'

export function RequestDialog({
  client,
  clients,
  draft,
  editingAction,
  error,
  isOpen,
  onChange,
  onClose,
  onSubmit,
  saveState,
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-modal-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editingAction ? 'Edit client request' : 'New client request'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="request-client">Client</Label>
              <Select
                onValueChange={(value) => onChange({ ...draft, clientId: value })}
                value={draft.clientId}
              >
                <SelectTrigger id="request-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="request-title">Title</Label>
              <Input
                id="request-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                placeholder="Approve creative batch"
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="request-description">Details</Label>
              <Textarea
                className="resize-none"
                id="request-description"
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                placeholder="What exactly do we need from the client?"
                value={draft.description}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="request-due-date">Due date</Label>
                <Input
                  id="request-due-date"
                  onChange={(event) => onChange({ ...draft, dueDate: event.target.value })}
                  type="date"
                  value={draft.dueDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-priority">Priority</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, priority: value })}
                  value={draft.priority}
                >
                  <SelectTrigger id="request-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(NEEDED_ACTION_PRIORITIES).map((priority) => (
                      <SelectItem key={priority} value={priority}>{NEEDED_ACTION_PRIORITY_META[priority].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-link">Related link</Label>
                <Input
                  id="request-link"
                  onChange={(event) => onChange({ ...draft, relatedLink: event.target.value })}
                  placeholder="https://..."
                  value={draft.relatedLink}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="request-owner">Owner</Label>
                <Input
                  id="request-owner"
                  onChange={(event) => onChange({ ...draft, ownerName: event.target.value })}
                  placeholder="Sarah Johnson"
                  value={draft.ownerName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-internal-notes">Internal notes</Label>
                <Textarea
                  className="resize-none"
                  id="request-internal-notes"
                  onChange={(event) => onChange({ ...draft, internalNotes: event.target.value })}
                  placeholder="Internal context. Never shown to the client."
                  value={draft.internalNotes}
                />
              </div>
            </div>

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={!client || Boolean(saveState)} type="submit">
              {saveState || (editingAction ? 'Save changes' : 'Create request')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
