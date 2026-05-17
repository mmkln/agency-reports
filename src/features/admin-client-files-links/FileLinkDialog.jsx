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
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_STATUS_META,
  CLIENT_FILE_LINK_TYPES,
  CLIENT_FILE_LINK_TYPE_META,
} from '../../entities/client-file-link'
import { VISIBILITY } from '../../entities/update'

export function FileLinkDialog({
  clients,
  draft,
  editingFileLink,
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
            <DialogTitle>{editingFileLink ? 'Edit file or link' : 'New file or link'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-link-client">Client</Label>
              <Select
                disabled={Boolean(editingFileLink)}
                onValueChange={(value) => onChange({ ...draft, clientId: value })}
                value={draft.clientId}
              >
                <SelectTrigger id="file-link-client">
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
              <Label htmlFor="file-link-title">Title</Label>
              <Input
                id="file-link-title"
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                required
                value={draft.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-link-url">URL</Label>
              <Input
                id="file-link-url"
                onChange={(event) => onChange({ ...draft, url: event.target.value })}
                placeholder="https://..."
                required
                type="url"
                value={draft.url}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="file-link-type">Type</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, type: value })}
                  value={draft.type}
                >
                  <SelectTrigger id="file-link-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CLIENT_FILE_LINK_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>{CLIENT_FILE_LINK_TYPE_META[type].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file-link-status">Status</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, status: value })}
                  value={draft.status}
                >
                  <SelectTrigger id="file-link-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CLIENT_FILE_LINK_STATUSES).map((status) => (
                      <SelectItem key={status} value={status}>{CLIENT_FILE_LINK_STATUS_META[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file-link-visibility">Visibility</Label>
                <Select
                  onValueChange={(value) => onChange({ ...draft, visibility: value })}
                  value={draft.visibility}
                >
                  <SelectTrigger id="file-link-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VISIBILITY.CLIENT_VISIBLE}>Client-visible</SelectItem>
                    <SelectItem value={VISIBILITY.INTERNAL}>Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="file-link-file-name">File name</Label>
                <Input
                  id="file-link-file-name"
                  onChange={(event) => onChange({ ...draft, fileName: event.target.value })}
                  value={draft.fileName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file-link-order">Display order</Label>
                <Input
                  id="file-link-order"
                  onChange={(event) => onChange({ ...draft, displayOrder: event.target.value })}
                  type="number"
                  value={draft.displayOrder}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-link-description">Description</Label>
              <Textarea
                className="resize-none"
                id="file-link-description"
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                value={draft.description}
              />
            </div>

            {error ? <p className="text-ui text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button disabled={Boolean(saveState)} type="submit">
              {saveState || (editingFileLink ? 'Save changes' : 'Create file/link')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
