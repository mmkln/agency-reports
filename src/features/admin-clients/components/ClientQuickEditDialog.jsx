import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
  Select,
} from '@/shared/ui'

export function ClientQuickEditDialog({
  client,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateForm,
  status,
}) {
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent className="max-w-modal-md">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Update the parent client record without changing workspace settings.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-component" id="edit-client-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateForm({ name: event.target.value })}
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Status</span>
            <Select onChange={(event) => onUpdateForm({ status: event.target.value })} value={form.status}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
          </label>
          {error ? (
            <ErrorBlock title="Client could not be updated">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={status === 'saving'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!client || status === 'saving'} form="edit-client-form" type="submit">
            {status === 'saving' ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
