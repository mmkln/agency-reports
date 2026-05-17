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
  CLIENT_REQUEST_TYPES,
  CLIENT_REQUEST_TYPE_META,
} from '../../entities/client-request'

export function ClientRequestDialog({
  draft,
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
            <DialogTitle>New request</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-request-title">Title</Label>
              <Input
                id="client-request-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                placeholder="Add a landing page variant"
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-request-description">Details</Label>
              <Textarea
                className="resize-none"
                id="client-request-description"
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                placeholder="Describe the outcome you want, context, and any constraints."
                required
                value={draft.description}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="client-request-type">Type</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, requestType: value })}
                  value={draft.requestType}
                >
                  <SelectTrigger id="client-request-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CLIENT_REQUEST_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>{CLIENT_REQUEST_TYPE_META[type].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-request-due-date">Desired date</Label>
                <Input
                  id="client-request-due-date"
                  onChange={(event) => onChange({ ...draft, desiredDueDate: event.target.value })}
                  type="date"
                  value={draft.desiredDueDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-request-link">Reference link</Label>
                <Input
                  id="client-request-link"
                  onChange={(event) => onChange({ ...draft, referenceLink: event.target.value })}
                  placeholder="https://..."
                  value={draft.referenceLink}
                />
              </div>
            </div>

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={Boolean(saveState)} type="submit">
              {saveState || 'Submit request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
