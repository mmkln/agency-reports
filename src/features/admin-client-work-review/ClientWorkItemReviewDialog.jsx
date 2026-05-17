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
  CLIENT_WORK_ITEM_STATUSES,
  CLIENT_WORK_ITEM_STATUS_META,
} from '../../entities/client-work-item'

export function ClientWorkItemReviewDialog({
  draft,
  error,
  isOpen,
  item,
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
            <DialogTitle>{item ? `Review ${item.title}` : 'Review client-facing work'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-work-title">Client-facing title</Label>
              <Input
                id="client-work-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-work-summary">Client-safe summary</Label>
              <Textarea
                className="resize-none"
                id="client-work-summary"
                onChange={(event) => onChange({ ...draft, summary: event.target.value })}
                placeholder="Short explanation the client can safely see."
                required
                value={draft.summary}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="client-work-status">Client-facing status</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, status: value })}
                  value={draft.status}
                >
                  <SelectTrigger id="client-work-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CLIENT_WORK_ITEM_STATUSES).map((status) => (
                      <SelectItem key={status} value={status}>
                        {CLIENT_WORK_ITEM_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-work-target-date">Target date</Label>
                <Input
                  id="client-work-target-date"
                  onChange={(event) => onChange({ ...draft, targetDate: event.target.value })}
                  type="date"
                  value={draft.targetDate}
                />
              </div>
            </div>

            {item?.sourceTask ? (
              <div className="rounded-control bg-control px-3 py-2 text-ui text-text-secondary">
                Source task: <span className="font-medium text-text-primary">{item.sourceTask.title}</span>
              </div>
            ) : null}

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={Boolean(saveState)} type="submit">
              {saveState || 'Save review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
