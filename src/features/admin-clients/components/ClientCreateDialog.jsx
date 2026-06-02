import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorBlock,
  Input,
} from '@/shared/ui'

export function ClientCreateDialog({
  createStatus,
  error,
  form,
  isOpen,
  onClose,
  onSubmit,
  onUpdateName,
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
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <form className="grid gap-component" id="create-client-form" onSubmit={onSubmit}>
          <label className="grid gap-item">
            <span className="text-label text-text-secondary">Client name</span>
            <Input
              autoFocus
              onChange={(event) => onUpdateName(event.target.value)}
              placeholder="Green Dental Group"
              required
              value={form.name}
            />
          </label>
          {error ? (
            <ErrorBlock title="Client could not be created">
              {error}
            </ErrorBlock>
          ) : null}
        </form>
        <DialogFooter>
          <Button disabled={createStatus === 'creating'} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={createStatus === 'creating'} form="create-client-form" type="submit">
            {createStatus === 'creating' ? 'Creating...' : 'Add client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
