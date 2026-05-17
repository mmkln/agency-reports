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
  CLIENT_UPDATE_TYPE_META,
  CLIENT_UPDATE_TYPES,
  VISIBILITY,
} from '../../entities/update'

export function ClientUpdateDialog({
  clients,
  draft,
  editingUpdate,
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
            <DialogTitle>{editingUpdate ? 'Edit update' : 'New update'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-update-client">Client</Label>
              <Select
                disabled={Boolean(editingUpdate)}
                onValueChange={(value) => onChange({ ...draft, clientId: value })}
                value={draft.clientId}
              >
                <SelectTrigger id="client-update-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-update-title">Title</Label>
              <Input
                id="client-update-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="client-update-type">Type</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, type: value })}
                  value={draft.type}
                >
                  <SelectTrigger id="client-update-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CLIENT_UPDATE_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>{CLIENT_UPDATE_TYPE_META[type].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="client-update-visibility">Visibility</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, visibility: value })}
                  value={draft.visibility}
                >
                  <SelectTrigger id="client-update-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client-visible</SelectItem>
                    <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="client-update-published-at">Published at</Label>
                <Input
                  id="client-update-published-at"
                  onChange={(event) => onChange({ ...draft, publishedAt: event.target.value })}
                  placeholder="2026-05-18T10:00:00.000Z"
                  value={draft.publishedAt}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-update-body">Summary</Label>
              <Textarea
                className="resize-none"
                id="client-update-body"
                onChange={(event) => onChange({ ...draft, body: event.target.value })}
                value={draft.body}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="client-update-changed">What changed</Label>
                <Textarea
                  className="resize-none"
                  id="client-update-changed"
                  onChange={(event) => onChange({ ...draft, whatChanged: event.target.value })}
                  value={draft.whatChanged}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-update-next">What next</Label>
                <Textarea
                  className="resize-none"
                  id="client-update-next"
                  onChange={(event) => onChange({ ...draft, whatNext: event.target.value })}
                  value={draft.whatNext}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client-update-action">Client action needed</Label>
              <Textarea
                className="resize-none"
                id="client-update-action"
                onChange={(event) => onChange({ ...draft, clientActionNeeded: event.target.value })}
                value={draft.clientActionNeeded}
              />
            </div>

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={Boolean(saveState)} type="submit">
              {saveState || (editingUpdate ? 'Save changes' : 'Create update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
