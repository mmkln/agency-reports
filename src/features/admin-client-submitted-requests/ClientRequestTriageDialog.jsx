import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import {
  CLIENT_REQUEST_STATUSES,
  CLIENT_REQUEST_STATUS_META,
} from '../../entities/client-request'

const selectableStatuses = [
  CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
  CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY,
  CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
  CLIENT_REQUEST_STATUSES.ACCEPTED,
  CLIENT_REQUEST_STATUSES.DECLINED,
  CLIENT_REQUEST_STATUSES.CONVERTED,
  CLIENT_REQUEST_STATUSES.COMPLETED,
  CLIENT_REQUEST_STATUSES.ARCHIVED,
]

export function ClientRequestTriageDialog({
  draft,
  error,
  isOpen,
  onChange,
  onClose,
  onSubmit,
  request,
  saveState,
}) {
  if (!request) {
    return null
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-modal-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="rounded-control border border-control-border bg-surface-subtle p-4">
              <p className="text-label text-text-muted">Client request</p>
              <p className="mt-2 text-body text-text-secondary">
                {request.description || 'No request details provided.'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-request-status">Status</Label>
              <Select
                onValueChange={(value) => onChange({ ...draft, status: value })}
                value={draft.status}
              >
                <SelectTrigger id="client-request-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {selectableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {CLIENT_REQUEST_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-request-response">Team response</Label>
              <Textarea
                className="resize-none"
                id="client-request-response"
                onChange={(event) => onChange({ ...draft, agencyResponse: event.target.value })}
                placeholder="What should the client know about this request?"
                required={draft.status === CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT}
                value={draft.agencyResponse}
              />
              {draft.status === CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT ? (
                <p className="text-label font-normal text-text-muted">
                  This response will also create a linked Action Needed clarification for the client.
                </p>
              ) : null}
            </div>

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={Boolean(saveState)} type="submit">
              {saveState || 'Save triage'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
